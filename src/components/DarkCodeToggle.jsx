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
import React,{useContext} from "react";
import Switch from "@material-ui/core/Switch";
import {ThemeContext} from './ThemeProvider';

function DarkCodeToggle() {

  const { theme, toggle, dark } = React.useContext(ThemeContext)
  
  return (
    <>
      <h4>Dark Editor</h4>
      <Switch checked={dark} onChange={toggle} />
    </>
  );
}

export default DarkCodeToggle;
