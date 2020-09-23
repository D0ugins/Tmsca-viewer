import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HashRouter, Route } from "react-router-dom";

import TestSearch from './Components/TestSearch'
import TestTake from './Components/TestTake';
import Resources from './Components/Resources'

function App() {
  const [test, setTest] = useState(JSON.parse(localStorage.getItem("current_test")))


  useEffect(() => {
    localStorage.setItem("current_test", JSON.stringify(test))
  }, [test])

  return (
    <>
    <HashRouter>
        <Route path="/" exact> <TestSearch setTest={setTest}/> </Route>
        <Route path="/take"> <TestTake test={test}/> </Route>
        <Route path="/resources"> <Resources/> </Route>
    </HashRouter>
   </>
  );
}

export default App;