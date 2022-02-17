import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import InfiniteScroll from "react-infinite-scroller";
import Masonry from "react-masonry-component";
import { masonryOptions } from "../exports";
import axios from "axios";
import { ReconstrStepContext } from "../context";
import { Typeahead } from "react-bootstrap-typeahead";
import { Form } from "react-bootstrap";

const BACKEND_UTIL_COLAB_URL = process.env.REACT_APP_BACKEND_UTIL_COLAB_URL;

function ImageGallery() {
  const refInfScroller = React.useRef(null);
  const [images, setImages] = React.useState([]);
  const [modelList, setModelList] = React.useState([]);
  const { modelName, setModelName } = React.useContext(ReconstrStepContext);
  const [allImages, setAllImages] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [initialized, setInitialized] = React.useState(false);
  const [modelNameString, setModelNameString] = React.useState([modelName]);
  const [imgFolderId, setImgFolderId] = React.useState(
    "1ciKIaNYxWGkVMEv_QrLyZjlFGiT4Zzl4"
  );
  const onDrop = useCallback(
    (acceptedFiles) => {
      const formData = new FormData();
      formData.append("img_folder_id", imgFolderId);
      acceptedFiles.forEach((file) => {
        formData.append("img_files", file);
      });
      console.log("onDrop: " + imgFolderId);
      axios
        .post(`${BACKEND_UTIL_COLAB_URL}/upload-images`, formData)
        .then((response) => {
          if (response.data.status_code == 201) {
            alert(
              `You have uploaded ${acceptedFiles.length} images successfully.`
            );
            getAllImages(modelName);
          }
        });
    },
    [imgFolderId, modelName]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const getAllImages = async (modelName) => {
    const response = await axios.get(
      `${BACKEND_UTIL_COLAB_URL}/img-folder?model_name=${modelName}`
    );
    console.log(modelName);
    setAllImages(response.data);
    setTotal(response.data.length);
    setImages([]);
  };

  const getImgsByPgs = async (pg) => {
    if (images.length == 0) {
      refInfScroller.current.pageLoaded = 0;
    }
    let imgs = images.concat(allImages.slice(pg - 1, pg - 1 + 10));
    setImages(imgs);
  };

  const getModelList = async () => {
    const response = await axios.get(
      `${BACKEND_UTIL_COLAB_URL}/get-model-list`
    );
    setModelList(response.data);
  };

  React.useEffect(() => {
    if (!initialized) {
      getAllImages(modelName);
      getModelList();
      setInitialized(true);
    }
  });

  const createNewFolder = async (modelName) => {
    const payload = {};
    payload["model_name"] = modelName;
    const response = await axios.post(
      `${BACKEND_UTIL_COLAB_URL}/new-folder`,
      payload
    );
    if (response.data.status_code == 201) {
      alert("You have created a new model folder successfully.");
    }
    setImgFolderId(response.data.folder_id);
    getAllImages(modelName);
  };
  const switchModel = (modelName) => {
    if (modelName.length > 0) {
      if (typeof modelName[0] !== "string") {
        modelName[0] = modelName[0]["modelName"];
      }
      createNewFolder(modelName[0]);
      setModelName(modelName[0]);
    }
  };

  return (
    <div style={{ backgroundColor: "rgb(238,238,238)" }}>
      <Form>
        <Form.Group>
          <Form.Label style={{ marginBottom: "0px", fontWeight: "bold" }}>
            Model Name
          </Form.Label>
          <Typeahead
            style={{ marginBottom: "10px", margingTop: "0px" }}
            allowNew
            id="basic-typeahead-single"
            labelKey="modelName"
            onChange={(modelName) => {
              setModelNameString(modelName);
              switchModel(modelName);
            }}
            options={modelList}
            placeholder="Choose a model..."
            selected={modelNameString}
            newSelectionPrefix="Create a new model: "
            size="small"
          />
        </Form.Group>
      </Form>
      <div
        style={{
          height: "530px",
          width: "350px",
          overflow: "auto",
          display: "inline-block",
          position: "relative",
        }}
        {...getRootProps()}
      >
        {isDragActive && (
          <div
            style={{
              border: "dashed grey 4px",
              backgroundColor: "rgba(255,255,255,.8)",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: 0,
                left: 0,
                textAlign: "center",
                color: "grey",
                fontSize: 36,
              }}
            >
              <div>drop here :)</div>
            </div>
          </div>
        )}
        {isDragActive && <input {...getInputProps()} />}
        <InfiniteScroll
          ref={refInfScroller}
          pageStart={0}
          loadMore={getImgsByPgs}
          hasMore={total > images.length}
          loader={<div key={0}>Loading ...</div>}
          useWindow={false}
        >
          <Masonry
            className={"grid"}
            elementType={"div"}
            options={masonryOptions}
            disableImagesLoaded={false}
            updateOnEachImageLoad={false}
          >
            {images.map((img, i) => {
              return (
                <div key={i} style={{}}>
                  <img src={img.thumbnailLink} style={{ width: "60%" }} />
                  <p style={{ fontSize: "10px" }}>{img.title}</p>
                </div>
              );
            })}
          </Masonry>
        </InfiniteScroll>
      </div>
    </div>
  );
}
export default ImageGallery;
