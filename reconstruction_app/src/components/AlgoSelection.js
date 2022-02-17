import React from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import { ReconstrStepContext } from "../context";

const AlgoSelection = () => {
  const {
    reconstrStep,
    preProcessLabelList,
    preProcessOptionsList,
    mainAlgoLabelList,
    mainAlgoOptionsList,
    postProcessLabelList,
    postProcessOptionsList,
    preprocessAlgoList,
    mainAlgoAlgoList,
    postprocessAlgoList,
  } = React.useContext(ReconstrStepContext);
  return (
    <div
      style={{
        height: `650px`,
        backgroundColor: "rgb(238, 238, 238)",
        border: "1px solid rgb(0,0,0)",
        overflow: "auto",
      }}
    >
      <Form id="algo-selection">
        <Form.Group className="mb-3" controlId="formGroupEmail">
          <Form.Label style={{ paddingLeft: "10px", fontWeight: "bold" }}>
            Pre-processing
          </Form.Label>
          {preProcessLabelList.map((label, i) => {
            return (
              <FloatingLabel
                key={i}
                controlId="floatingSelect"
                label={reconstrStep > 0 ? `${label} ✔` : `${label}  `}
              >
                <Form.Select
                  aria-label="Floating label select example"
                  disabled={reconstrStep > i}
                  value={preprocessAlgoList[i][0]}
                  onChange={(e) => {
                    console.log("e.target.value", e.target.value);
                    preprocessAlgoList[i][1](e.target.value);
                  }}
                >
                  {preProcessOptionsList[i].map((option, j) => {
                    return (
                      <option key={j} value={option}>
                        {option}
                      </option>
                    );
                  })}
                </Form.Select>
              </FloatingLabel>
            );
          })}
        </Form.Group>
        <Form.Group className="mb-3" controlId="formGroupEmail">
          <Form.Label style={{ paddingLeft: "10px", fontWeight: "bold" }}>
            Main Algorithm
          </Form.Label>
          {mainAlgoLabelList.map((label, i) => {
            return (
              <FloatingLabel
                key={i}
                controlId="floatingSelect"
                label={
                  reconstrStep > i + preProcessLabelList.length
                    ? `${label} ✔`
                    : `${label}  `
                }
              >
                <Form.Select
                  aria-label="Floating label select example"
                  disabled={reconstrStep > i + preProcessLabelList.length}
                  value={mainAlgoAlgoList[i][0]}
                  onChange={(e) => {
                    console.log("e.target.value", e.target.value);
                    mainAlgoAlgoList[i][1](e.target.value);
                  }}
                >
                  {mainAlgoOptionsList[i].map((option, j) => {
                    return (
                      <option key={j} value={option}>
                        {option}
                      </option>
                    );
                  })}
                </Form.Select>
              </FloatingLabel>
            );
          })}
        </Form.Group>
        <Form.Group className="mb-3" controlId="formGroupEmail">
          <Form.Label style={{ paddingLeft: "10px", fontWeight: "bold" }}>
            Post-processing
          </Form.Label>
          {postProcessLabelList.map((label, i) => {
            return (
              <FloatingLabel
                key={i}
                controlId="floatingSelect"
                label={
                  reconstrStep >
                  i + preProcessLabelList.length + mainAlgoLabelList.length
                    ? `${label} ✔`
                    : `${label}  `
                }
              >
                <Form.Select
                  aria-label="Floating label select example"
                  disabled={
                    reconstrStep >
                    i +
                      i +
                      preProcessLabelList.length +
                      mainAlgoLabelList.length
                  }
                  value={postprocessAlgoList[i][0]}
                  onChange={(e) => {
                    console.log("e.target.value", e.target.value);
                    postprocessAlgoList[i][1](e.target.value);
                  }}
                >
                  {postProcessOptionsList[i].map((option, j) => {
                    return (
                      <option key={j} value={option}>
                        {option}
                      </option>
                    );
                  })}
                </Form.Select>
              </FloatingLabel>
            );
          })}
        </Form.Group>
      </Form>
    </div>
  );
};

export default AlgoSelection;
