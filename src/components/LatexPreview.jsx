//This is the default placeholder Markup for the App
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable arrow-body-style */
/* eslint-disable padding-line-between-statements */
/* eslint-disable semi */
/* eslint-disable arrow-parens */
/* eslint-disable block-scoped-var */
/* eslint-disable no-redeclare */
/* eslint-disable one-var */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { CgSoftwareDownload as SaveIcon } from "react-icons/cg";
import { CgCoffee as CompileIcon } from "react-icons/cg";
import { RiFullscreenFill as FullScreenIcon } from "react-icons/ri";
import { Tooltip } from "@material-ui/core";
import { Document, Page, pdfjs } from "react-pdf";
import Loader from "react-loader-spinner";
import styled, { css } from "styled-components";
import themeData from "../data/theme";
import useLocalStorage from "../hooks/useLocalStorage";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


function LatexPreview({ content,isCompile}) {
  const [rawFile, setRawFile] = useState("");
  const [rawResponse, setRawResponse] = useState({});
  const handle = useFullScreenHandle();
  const [isLoading, setIsLoading] = useState(false);
  
 
  const [numPages, setNumPages] = useState(null);
  const [activeTheme, setActiveTheme] = useLocalStorage("theme", themeData[0]);

  useEffect(() => {
    handleCompile();
  }, []);

  
  const postData = () => {
    const content = localStorage.getItem("latex");
    const encodedString = new Buffer(content).toString("base64");

    const formData = new FormData();
    formData.append("foo", encodedString);

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        setIsLoading(false);
        if (response.ok) {
          return response.blob();
        } else {
          return response.json();
        }
      })
      .then((response) => {
  
        if (response.error) {  
          setRawResponse(response.error);
          throw new Error();
        }
        return response;
      })
      .then((response) => {
        var reader = new FileReader();
        reader.onloadend = () => {
          var base64data = reader.result;
          setRawResponse("");
          setRawFile(base64data);
        };
        reader.readAsDataURL(response);
      })
      .catch((error) => console.log(error));
  };

  const handleFullScreen = () =>
    handle.active ? handle.exit() : handle.enter();

  const handleSaveClick = () => {
    let link = document.createElement("a");
    link.href = rawFile;
    link.download = "download.pdf";
    link.click();
  };
  const handleCompile = () => {
    setIsLoading(true);
    isCompile(true);
    postData();
  };
  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

  return (
    <div className="latex-preview scroll">
      <div className="section-title">
        <h3>Preview</h3>
        <div className="right-section">
          <Tooltip title="Compile">
            <button className="btn" onClick={handleCompile}>
              <CompileIcon />
            </button>
          </Tooltip>
          <Tooltip title="Download PDF">
            <button className="btn" onClick={handleSaveClick}>
              <SaveIcon />
            </button>
          </Tooltip>
          <Tooltip title="FullScreen">
            <button className="btn" onClick={handleFullScreen}>
              <FullScreenIcon />
            </button>
          </Tooltip>
        </div>
      </div>
      <FullScreen handle={handle}>
        <div
          id="preview"
          className={`html-div ${handle.active ? "preview-fullscreen" : ""}`}
        >
          {(() => {
            if (isLoading) {
              var color;
              if (localStorage.getItem("theme")) {
                color = JSON.parse(localStorage.getItem("theme")).primaryColor;
              } else {
                color = activeTheme.primaryColor;
              }
              return (
                <Fallbackcontainer>
                  <Loader
                    type="Puff"
                    height={100}
                    color={color}
                    width={100}
                    timeout={3000}
                  />{" "}
                </Fallbackcontainer>
              );
            }

            if (Object.keys(rawResponse).length !== 0) {
              return <div>{rawResponse}</div>;
            }
            if (Object.keys(rawFile).length !== 0) {
              return (
                <DefaultContainer>
                  <Document
                    file={rawFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                  >
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page
                        renderTextLayer={false}
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        scale={1.5}
                      />
                    ))}
                  </Document>
                </DefaultContainer>
              );
            }
          })()}
        </div>
      </FullScreen>
    </div>
  );
}

export default LatexPreview;

const Fallbackcontainer = styled.div`
  transform: translateX(50%);
`;
const DefaultContainer = styled.div`
  color: transparent;
`;
