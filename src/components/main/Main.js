import React, { Component, Suspense, useState, useEffect } from "react";
import { observer, inject } from "mobx-react";
import ReactGA from "react-ga";

import "../../App.css";

import TopBar from "../topBar/TopBar";
import TotalValue from "../totalValue/TotalValue";
import MiniCards from "../miniCards/MiniCards";
import Banner from "../banner/Banner";
import DefiList from "../defiList/DefiList";
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
/*                     <TopBar />

 <DefiList />
 */
