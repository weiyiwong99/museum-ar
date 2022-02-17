import React from "react";
import { ReconstrStepContext } from "../context";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { TrackballControls, Html, useProgress } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { DDSLoader } from "three-stdlib";
import { Suspense } from "react";
import PropTypes from "prop-types";
import VisualizationErrorBoundary from "./VisualizationErrorBoundary";

THREE.DefaultLoadingManager.addHandler(/\.dds$/i, new DDSLoader());

const BACKEND_UTIL_COLAB_URL = process.env.REACT_APP_BACKEND_UTIL_COLAB_URL;

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

const Scene = (props) => {
  const materials = useLoader(
    MTLLoader,
    `${BACKEND_UTIL_COLAB_URL}/static/${props.modelName}/result_textured/result_textured.mtl`
  );
  const obj = useLoader(
    OBJLoader,
    `${BACKEND_UTIL_COLAB_URL}/static/${props.modelName}/result_textured/result_textured.obj`,
    (loader) => {
      materials.preload();
      loader.setMaterials(materials);
    }
  );

  obj.rotation.z = Math.PI * 1.5; // rotate the model
  obj.rotation.y = Math.PI; // rotate the model
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.center();
      // child.geometry.rotation.y = Math.PI;
    }
  });
  return <primitive key={props.modelName} object={obj} scale={0.6} />;
};

Scene.propTypes = {
  modelName: PropTypes.string,
};

export default function ThreeDPlyVisualizer() {
  const { modelName } = React.useContext(ReconstrStepContext);
  return (
    <div>
      <Canvas style={{ height: `600px` }}>
        <Suspense fallback={<Loader />}>
          <axesHelper />
          <ambientLight intensity={0.2} />
          {/* <directionalLight /> */}
          <VisualizationErrorBoundary>
            <Scene modelName={modelName} />
          </VisualizationErrorBoundary>
          <TrackballControls />
          <color attach="background" args={["rgb(17,103,177)"]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
