import { Container, Row, Col } from "react-bootstrap";
import AlgoSelection from "./AlgoSelection";
import ThreeDPlyVisualizer from "./ThreeDPlyVisualizer";
import ImageGallery from "./ImageGallery";
import ReconstructionBtn from "./ReconstructionBtn";
import { ReconstrStepContext } from "../context";
import React from "react";

const Layout = () => {
  const [reconstrStep, setReconstrStep] = React.useState(0);
  const [modelName, setModelName] = React.useState("Ganesha");
  const preProcessLabelList = ["JPEG Artifact Removal"];
  const preProcessOptionsList = [["FBCNN"]];
  const mainAlgoLabelList = [
    "Feature Extraction",
    "Feature Matching",
    "Structure from Motion",
    "Image Undistorter",
    "Depth Map",
  ];
  const mainAlgoOptionsList = [
    ["SuperPoint"],
    ["SuperGlue"],
    ["COLMAP"],
    ["COLMAP"],
    ["COLMAP", "Vis-MVSNet"],
  ];
  const postProcessLabelList = [
    "Point Cloud Simplification",
    "Outlier Removal",
    "Meshing",
    "Disconnected Component Removal",
    "Mesh Decimation",
    "Non-manifold",
    "T-vertices Removal",
    "Close Hole",
    "Mesh Smoothing",
    "Texture Mapping",
  ];
  const postProcessOptionsList = [
    ["PyMeshLab"],
    ["Raidus Outlier Removal"],
    ["Poisson (COLMAP)"],
    ["PyMeshLab"],
    ["Quadric Edge Collapse"],
    ["PyMeshLab"],
    ["PyMeshLab"],
    ["PyMeshLab"],
    ["Laplacian Smoothing"],
    ["MVS-Texturing"],
  ];
  let preprocessAlgoList = [];
  for (let i = 0; i < preProcessLabelList.length; i++) {
    preprocessAlgoList.push(React.useState(""));
  }
  let mainAlgoAlgoList = [];
  for (let i = 0; i < mainAlgoLabelList.length; i++) {
    mainAlgoAlgoList.push(React.useState(""));
  }
  let postprocessAlgoList = [];
  for (let i = 0; i < postProcessLabelList.length; i++) {
    postprocessAlgoList.push(React.useState(""));
  }
  return (
    <Container fluid>
      <ReconstrStepContext.Provider
        value={{
          reconstrStep,
          setReconstrStep,
          modelName,
          setModelName,
          preProcessLabelList,
          preProcessOptionsList,
          mainAlgoLabelList,
          mainAlgoOptionsList,
          postProcessLabelList,
          postProcessOptionsList,
          preprocessAlgoList,
          mainAlgoAlgoList,
          postprocessAlgoList,
        }}
      >
        <Row>
          <Col
            md="auto"
            style={{
              padding: "0px",
            }}
          >
            <AlgoSelection />
          </Col>
          <Col>
            <Row>
              <ReconstructionBtn />
            </Row>
            <Row>
              <Col>
                <Row
                  style={{
                    backgroundColor: "rgb(203, 203, 203)",
                    border: "1px solid rgb(0,0,0)",
                    paddingLeft: "5px",
                    fontWeight: "bold",
                  }}
                >
                  3D Viewer
                </Row>
                <Row
                  style={{
                    backgroundColor: "rgb(17,103,177)",
                    border: "1px solid rgb(0,0,0)",
                  }}
                >
                  <ThreeDPlyVisualizer />
                </Row>
              </Col>
              <Col
                md="auto"
                style={{
                  backgroundColor: "rgb(238, 238, 238)",
                  border: "1px solid rgb(0,0,0)",
                }}
              >
                <Row
                  style={{
                    backgroundColor: "rgb(203, 203, 203)",
                    border: "1px solid rgb(0,0,0)",
                    paddingLeft: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Images
                </Row>
                <ImageGallery />
              </Col>
            </Row>
          </Col>
        </Row>
      </ReconstrStepContext.Provider>
    </Container>
  );
};

export default Layout;
