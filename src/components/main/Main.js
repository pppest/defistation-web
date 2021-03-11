import React, { Component, Suspense, useState, useEffect } from "react";
import { observer, inject } from "mobx-react";
import ReactGA from "react-ga";

import "../../App.css";

import TotalValue from "../totalValue/TotalValue";
import Footer from "../footer/Footer";

const Main = observer(() => {
  useEffect(() => {
    // Google Analytics
    if (process.env.NODE_ENV === "production")
      ReactGA.pageview(window.location.pathname + window.location.search);

    return () => {
      console.log("cleanup");
    };
  }, []);

  return (
    <div className="wrapper">
      <TotalValue defiName="DeFi" />
      <Footer />
    </div>
  );
});

export default Main;
