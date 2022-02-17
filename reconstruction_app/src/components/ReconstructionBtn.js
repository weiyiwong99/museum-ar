import React from "react";
import axios from "axios";
import { ReconstrStepContext } from "../context";
import { Button } from "react-bootstrap";

const BACKEND_GPU_COLAB_URL = process.env.REACT_APP_BACKEND_GPU_COLAB_URL;

const PROCESS_PATH = [
  "jpeg-artifact-removal",
  "features-extraction",
  "features-matching",
  "colmap-sfm",
  "colmap_img_undistorter",
  "colmap-mvs",
  "pymeshlab-pc-simplification",
  "outlier-removal",
  "colmap-poisson-mesher",
  "pymeshlab-post-process",
  "mvs-texturing",
];

const ReconstructionBtn = () => {
  const {
    setReconstrStep,
    modelName,
    preprocessAlgoList,
    mainAlgoAlgoList,
    postprocessAlgoList,
  } = React.useContext(ReconstrStepContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const reconstructionAPI = async () => {
    let algo = "";
    setIsLoading(true);
    for (let i = 0; i < PROCESS_PATH.length; i++) {
      setReconstrStep(i < PROCESS_PATH.length - 2 ? i : i + 5);
      if (i < preprocessAlgoList.length) {
        algo = preprocessAlgoList[i];
      } else if (i - preprocessAlgoList.length < mainAlgoAlgoList.length) {
        algo = mainAlgoAlgoList[i - preprocessAlgoList.length];
      } else {
        algo =
          postprocessAlgoList[
            i - preprocessAlgoList.length - mainAlgoAlgoList.length
          ];
      }
      const formData = new FormData();
      formData.append("model_name", modelName);
      formData.append("algo", algo);
      const response = await axios.post(
        `${BACKEND_GPU_COLAB_URL}/${PROCESS_PATH[i]}`,
        formData
      );
      if (response.data.status_code != 200) {
        // alert("Model Reconstruction has failed for some reasons.");
        break;
      }
    }
    setIsLoading(false);
  };

  return (
    <Button
      form="algo-selection"
      style={{
        fontWeight: "bold",
      }}
      size="sm"
      variant="secondary"
      disabled={isLoading}
      onClick={!isLoading ? reconstructionAPI : null}
    >
      {isLoading ? "Loading…" : "Click to Start reconstruction"}
    </Button>
  );
};

export default ReconstructionBtn;
