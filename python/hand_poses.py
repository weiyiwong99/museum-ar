import boto3
import cv2
import numpy as np
import os
import torch
from PIL import Image
from torchvision import transforms
from project.settings import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BASE_DIR
from .utils.model import ShallowUNet
from .utils.prep_utils import (
    COLORMAP,
    heatmaps_to_coordinates,
    find_distance,
    RAW_IMG_SIZE,
    MODEL_IMG_SIZE,
    DATASET_MEANS,
    DATASET_STDS,
)
 
class HandPoses:
    def __init__(self):
        self.hand_poses = []
        self.kps = []
        self.dists = []
        self.dirname = os.path.dirname(__file__)
        self.config = {
            "weights_path": "tmp/cross-hands.weights",
            "model_path": "python/darknet/cfg/cross-hands.cfg",
            "labels_path": "python/darknet/data/obj.names",
            "kp_model_path": "python/weights/model_final",
            "device": "cpu",
        }
        # load the COCO class labels our YOLO model was trained on
        labelsPath = os.path.join(BASE_DIR, self.config["labels_path"])
        self.LABELS = open(labelsPath).read().strip().split("\n")

        # derive the paths to the YOLO weights and model configuration
        weightsPath = os.path.join(BASE_DIR, self.config["weights_path"])
        configPath = os.path.join(BASE_DIR, self.config["model_path"])
        
        if not os.path.exists(weightsPath):
            s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID , aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
            s3.download_file('museum-ar-bucket', 'cross-hands.weights', weightsPath)

        # load our YOLO object detector trained on COCO dataset (80 classes)
        self.net = cv2.dnn.readNetFromDarknet(configPath, weightsPath)

        # determine only the *output* layer names that we need from YOLO
        self.ln = self.net.getLayerNames()
        self.ln = [self.ln[i - 1] for i in self.net.getUnconnectedOutLayers()]
             
        # load keypoint detector model
        self.model = ShallowUNet(3, 21)
        self.model.load_state_dict(
            torch.load(os.path.join(BASE_DIR, self.config["kp_model_path"]), map_location=torch.device(self.config["device"]))
        )
        self.model.eval()
        
    def detect_bbs(self, image):
        # resize the frame and then detect people (and only people) in it
        self.bbs = self.detect_hands(image, self.net, self.ln, handIdx=self.LABELS.index("hand"))
    
    def detect_hands(self, frame, net, ln, handIdx=0):
        MIN_CONF = 0.3
        NMS_THRESH = 0.3
        
        # grab the dimensions of the frame and  initialize the list of
        # results
        (H, W) = frame.shape[:2]
        results = []

        # construct a blob from the input frame and then perform a forward
        # pass of the YOLO object detector, giving us our bounding boxes
        # and associated probabilities
        blob = cv2.dnn.blobFromImage(frame, 1 / 255.0, (416, 416), swapRB=True, crop=False)
        net.setInput(blob)
        layerOutputs = net.forward(ln)

        # initialize our lists of detected bounding boxes, centroids, and
        # confidences, respectively
        boxes = []
        confidences = []

        # loop over each of the layer outputs
        for output in layerOutputs:
            # loop over each of the detections
            for detection in output:
                # extract the class ID and confidence (i.e., probability)
                # of the current object detection
                scores = detection[5:]
                classID = np.argmax(scores)
                confidence = scores[classID]

                # filter detections by (1) ensuring that the object
                # detected was a person and (2) that the minimum
                # confidence is met
                if classID == handIdx and confidence > MIN_CONF:
                    # scale the bounding box coordinates back relative to
                    # the size of the image, keeping in mind that YOLO
                    # actually returns the center (x, y)-coordinates of
                    # the bounding box followed by the boxes' width and
                    # height
                    box = detection[0:4] * np.array([W, H, W, H])
                    (centerX, centerY, width, height) = box.astype("int")

                    # use the center (x, y)-coordinates to derive the top
                    # and and left corner of the bounding box
                    x = int(centerX - (width / 2))
                    y = int(centerY - (height / 2))

                    # update our list of bounding box coordinates,
                    # centroids, and confidences
                    boxes.append([x, y, int(width), int(height)])
                    confidences.append(float(confidence))

        # apply non-maxima suppression to suppress weak, overlapping
        # bounding boxes
        idxs = cv2.dnn.NMSBoxes(boxes, confidences, MIN_CONF, NMS_THRESH)

        # ensure at least one detection exists
        if len(idxs) > 0:
            # loop over the indexes we are keeping
            for i in idxs.flatten():
                # extract the bounding box coordinates
                (x, y) = (boxes[i][0], boxes[i][1])
                (w, h) = (boxes[i][2], boxes[i][3])
                cX = x + w / 2
                cY = y + h / 2

                # update our results list to consist of the person
                # prediction probability, bounding box coordinates,
                # and the centroid
                # prevent "tile cannot extend outside image" error
                if(x < 0):
                    w += x
                    x = max(0, x)
                if(y < 0):
                    h += y
                    y = max(0, y)
                r = (confidences[i], (x, y, x + w, y + h), (cX, cY))
                results.append(r)

        # return the list of results
        return results
        
    def detect_kps(self, image):
        self.kps = []
        self.dists = []
        
        image_transform = transforms.Compose(
            [
                transforms.Resize((MODEL_IMG_SIZE, MODEL_IMG_SIZE)),
                transforms.ToTensor(),
                transforms.Normalize(mean=DATASET_MEANS, std=DATASET_STDS),
            ]
        )
        
        if self.bbs:
            for bb in self.bbs:
                (x_min, y_min, x_max, y_max) = bb[1]
                
                # keypoints detection
                roi = image[y_min:y_max, x_min:x_max]
                roi_w = x_max - x_min
                roi_h = y_max - y_min
                img_pil = Image.fromarray(roi)
                img_tensor = image_transform(img_pil)
                img_tensor = img_tensor[None, :, :, :]

                pred_heatmap = self.model(img_tensor)
                pred_heatmap = pred_heatmap.detach().numpy()
                pred_keypoints = heatmaps_to_coordinates(pred_heatmap) # 1*21*2
                pred_keypoints = pred_keypoints[0] # 21*2
                pred_keypoints[:, 0] = pred_keypoints[:, 0] * roi_w
                pred_keypoints[:, 1] = pred_keypoints[:, 1] * roi_h
                
                # convert [[x, y], ...] to [(x, y), ...]
                kps = []
                for kp in pred_keypoints:
                    pt = (int(x_min + kp[0]), int(y_min + kp[1]))
                    kps.append(pt)
                
                self.calc_dists(kps)
                self.kps.append(kps)
                
    def calc_dists(self, kps):
        dist = find_distance(kps[4], kps[8]) # thumb & index finger
        self.dists.append(dist)
    
    def draw_bb_kp(self, image):
        if self.bbs:
            for n, bb in enumerate(self.bbs):
                (x_min, y_min, x_max, y_max) = bb[1]
                
                # debug: draw rectangle around detected items 
                cv2.rectangle(image,(x_min, y_min),(x_max, y_max),(255,0,0),2)
                
                if(len(self.kps) == len(self.bbs)):
                    for pt in self.kps[n]:
                        cv2.circle(image, pt, 2, (0, 0, 0))
                    
                    for finger, params in COLORMAP.items():
                        for i in range(len(params["ids"])-1):
                            pt1 = (self.kps[n][params["ids"][i]][0], self.kps[n][params["ids"][i]][1])
                            pt2 = (self.kps[n][params["ids"][i+1]][0], self.kps[n][params["ids"][i+1]][1])
                            cv2.line(image, pt1, pt2, params["color_numeric"])
                        
                    for dist in self.dists:
                        cv2.putText(image, 'dist:' + str(dist), (20, 450), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 200, 0), 3, cv2.LINE_AA)
        
        return image