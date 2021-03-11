import React, { Fragment, Suspense, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { observer, inject } from "mobx-react";
import { useHistory, useLocation } from "react-router-dom";

import "../../App.css";

const Footer = observer((props) => {
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className="footer">
      <p>Powered By Cosmostation © 2020 COSMOSTATION</p>
    </div>
  );
});

export default Footer;
