from django.http.response import HttpResponse
from django.shortcuts import render
from .models import Artifact, Survey
from project.settings import STATIC_URL
from project.wsgi import sio
from python.hand_poses import HandPoses
import base64
import cv2
import json
import numpy as np
import os

# Create your views here.

def home(request):
    artifacts = Artifact.objects.all()
    return render(request, 'home.html', {'artifacts': artifacts})

def view_ar(request, id):
    global handPoses
    handPoses = HandPoses()
    artifact = Artifact.objects.get(pk=id)
    materials = artifact.material_set.all()
    for material in materials:
        materials_path = '..' + STATIC_URL + os.path.dirname(material.filePath) + '/'
        fname = os.path.basename(material.filePath)
        if '.obj' in fname:
            obj_fname = fname
        if '.mtl' in fname:
            mtl_fname = fname
    return render(request, 'view_ar.html', {'artifact': artifact, 'materials_path': materials_path, 'obj_fname': obj_fname, 'mtl_fname': mtl_fname})
    
@sio.event
def frame(sid, data):
    frame = _from_b64(data["frame"])
    cX = frame.shape[1] / 2
    cY = frame.shape[0] / 2
    frame_w = frame.shape[1]
    frame_h = frame.shape[0]
    handPoses.detect_bbs(frame)
    handPoses.detect_kps(frame)
    dist = handPoses.dists[0] if handPoses.dists else 0
    if handPoses.bbs:
        (cX, cY) = handPoses.bbs[0][2]
    response = {
        "dist": dist,
        "x_pos": cX,
        "y_pos": cY,
        "frame_w": frame_w,
        "frame_h": frame_h,
    }
    sio.emit("response", response)
    image = handPoses.draw_bb_kp(frame)
    return _to_b64(image)

def handle_new_survey_data(request):
    if request.method == 'POST':
        json_str = request.POST.get('data')
        survey_json = json.loads(json_str, object_hook=_decode)["survey"]
        Survey.objects.create(**survey_json)
        return HttpResponse(status=200)
    return HttpResponse(status=500)

def _from_b64(uri):
    '''
        Convert from b64 uri to OpenCV image
        Sample input: 'data:image/jpg;base64,/9j/4AAQSkZJR......'
    '''
    encoded_data = uri.split(',')[1]
    data = base64.b64decode(encoded_data)
    np_arr = np.fromstring(data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

def _to_b64(img):
    '''
        Convert from OpenCV image to b64 uri
        Sample output: 'data:image/jpg;base64,/9j/4AAQSkZJR......'
    '''
    _, buffer = cv2.imencode('.jpg', img)
    uri = base64.b64encode(buffer).decode('utf-8')
    return f'data:image/jpg;base64,{uri}'

def _decode(o):
    '''
        Convert numeric json data to int
    '''
    if isinstance(o, str):
        try:
            return int(o)
        except ValueError:
            return o
    elif isinstance(o, dict):
        return {k: _decode(v) for k, v in o.items()}
    elif isinstance(o, list):
        return [_decode(v) for v in o]
    else:
        return o