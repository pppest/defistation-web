import React, {
  Component,
  Fragment,
  Suspense,
  useState,
  useEffect,
} from "react";
import { observer, inject } from "mobx-react";
import { Link, Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { useHistory, useLocation } from "react-router-dom";

import Main from "./components/main/Main";

// Font
import "typeface-montserrat"; // $ npm install --save typeface-montserrat
import "typeface-roboto"; // $ npm install --save typeface-roboto

import "./App.css";

// Google Analytics
import ReactGA from "react-ga"; // https://github.com/react-ga/react-ga
if (process.env.NODE_ENV === "production") {
  ReactGA.initialize("UA-181754248-1");
}

const App = observer(() => {
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    return () => {
      console.log("cleanup");
    };
  }, []);

  return (
    <>
      <Suspense fallback={<div></div>}>
        <Switch>
          <Route exact path="/" component={Main} />
        </Switch>
      </Suspense>
    </>
  );
});

export default App;
