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
import React, { useEffect, useState, useRef } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import { Alert, AlertTitle } from "@material-ui/lab";
import placeholder from "../data/placeholder";
import { CgSoftwareDownload as SaveIcon } from "react-icons/cg";
import { MdContentCopy as CopyIcon } from "react-icons/md";
import { MdDelete as CleanIcon } from "react-icons/md";
import { Tooltip } from "@material-ui/core";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import { ThemeContext, initialState } from "./ThemeProvider";
import useClipboard from "react-use-clipboard";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-noconflict/snippets/latex";
import "ace-builds/src-noconflict/ext-language_tools";



function LatexEditAce({ content, changeContent,isCompile,compile }) {
  const [open, setOpen] = useState(false);
  const editorRef = useRef(null);
  const [isCopied, setCopied] = useClipboard(content);

  const [annotations, setAnnotations] = useState([]);
  

  useEffect(() => {
    
    if (content === "") {
      localStorage.setItem("latex", placeholder);
    } else {
      localStorage.setItem("latex", content);
    }
  }, [content]);

  useEffect(() => {
    var encodedString = "";
    if (content === "") {
      encodedString = new Buffer(placeholder).toString("base64");
    } else {
      encodedString = new Buffer(content).toString("base64");
    }

    const formData = new FormData();
    formData.append("foo", encodedString);

    fetch("/compile", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        return response.json();
    
      }).then((response) => {
        setAnnotations(response)
        isCompile(false);
      })
      .catch((error) => console.log(error));
  }, [compile]);


  const handleEditorChange = (value, event) => {
    changeContent(value);
  };

  const handleClearClick = () => {
    changeContent("");
    editorRef.current.focus();
  };

  const handleDownloadClick = () => {
    let blob = new Blob([content], {
      type: "text/plain",
    });
    let a = document.createElement("a");
    a.download = "latex.tex";
    a.href = window.URL.createObjectURL(blob);
    a.click();
  };

  const handleCopyClick = () => {
    setCopied(content);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ThemeContext.Consumer>
      {({ theme, toggle }) => (
        <div className="latex-edit scroll">
          <div className="section-title">
            <h3>Latex editor</h3>
            <div className="right-section">
              <Tooltip title="Download Latex">
                <button onClick={handleDownloadClick} className="btn">
                  <SaveIcon />
                </button>
              </Tooltip>
              <Tooltip title="Copy to Clipboard">
                <button onClick={handleCopyClick} className="btn">
                  <CopyIcon />
                </button>
              </Tooltip>
              <Tooltip title="Clean">
                <button onClick={handleClearClick} className="btn">
                  <CleanIcon />
                </button>
              </Tooltip>
            </div>
          </div>

          <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
            <Alert
              onClose={handleClose}
              severity="success"
              elevation={6}
              variant="filled"
            >
              <AlertTitle>Copied</AlertTitle>
              The latex is copied to your clipboard
            </Alert>
          </Snackbar>
          <AceEditor
            mode="latex"
            value={content}
            theme={theme.name}
            className="editable editor"
            onChange={handleEditorChange}
            onValidate={setAnnotations}
            name="editor"
            height="96%"
            width="100%"
            fontSize="15px"
            ref={editorRef}
            annotations={annotations}
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={true}
            enableSnippets={true}
            editorProps={{ $blockScrolling: true }}
          />
        </div>
      )}
    </ThemeContext.Consumer>
  );
}
export default LatexEditAce;
