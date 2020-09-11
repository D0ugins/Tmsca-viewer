import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route } from "react-router-dom";

import TestSearch from './Components/TestSearch'
import TestView from './Components/TestView'
import TestTake from './Components/TestTake';
import Resources from './Components/Resources'

function App() {
  const [test, setTest] = useState(JSON.parse(localStorage.getItem("current_test")))


  useEffect(() => {
    localStorage.setItem("current_test", JSON.stringify(test))
  }, [test])

  return (
    <>
    <Router>
        <Route path="/Tmsca-viewer" exact> <TestSearch setTest={setTest}/> </Route>
        <Route path="/Tmsca-viewer/view"> <TestView test={test}/> </Route>
        <Route path="/Tmsca-viewer/take"> <TestTake test={test}/> </Route>
        <Route path="/Tmsca-viewer/resources"> <Resources/> </Route>
    </Router>
   </>
  );
}

export default App;