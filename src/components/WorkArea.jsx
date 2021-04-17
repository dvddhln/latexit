import React, { useState, useEffect } from "react";
import Split from "react-split";
import LatexEditAce from "./LatexEditAce";
import LatexPreview from "./LatexPreview";
import placeholder from "../data/placeholder";

function WorkArea() {
  let markdown = localStorage.getItem("markdown") || placeholder;
  const [latex, setLatex] = useState(markdown);
  const [orientation, setOrientation] = useState("horizontal");
  const [compile, isCompile] = useState(true);

  useEffect(() => {
    let changeOrientation = () => {
      setOrientation(window.innerWidth < 600 ? "vertical" : "horizontal");
    };
    changeOrientation();
    window.onresize = changeOrientation;
  }, []);

  return (
    <div className="work-area">
      <Split
        className="wrapper-card"
        sizes={[50, 50]}
        minSize={orientation === "horizontal" ? 300 : 100}
        expandToMin={true}
        gutterAlign="center"
        direction={orientation}
      >
        <LatexEditAce content={latex} changeContent={setLatex} isCompile={isCompile} compile={compile} />
        <LatexPreview content={latex} isCompile={isCompile} />
      </Split>
    </div>
  );
}

export default WorkArea;
