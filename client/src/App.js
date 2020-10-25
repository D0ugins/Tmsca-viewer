import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Axios from "axios"

import TestSearch from './Components/TestSearch';
import TestTake from './Components/TestTake';
import Resources from './Components/Resources';
import Login from './Components/Users/Login';
import Register from './Components/Users/Register';
import Results from './Components/Users/Results'
import Trainer from './Components/Trainer/Trainer'
import TrainerSelect from './Components/Trainer/TrainerSelect'
import Exaplanation from './Components/Trainer/Explanation'
import Guides from './Components/Guides';

import UserContext from './Context/UserContext'

function App() {
  const [user, setUser] = useState({
    token: undefined,
    user: undefined
  });

  // Loads user data based on token from localstorage
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        let token = localStorage.getItem("auth-token");
        if (token === undefined) { localStorage.setItem("auth-token", ""); token = ""; }

        const valid = await Axios.post(`/api/users/isTokenValid`, null,
          { headers: { "x-auth-token": token } }
        );

        if (valid?.data) {
          const userRes = await Axios.get(`/api/users`,
            { headers: { "x-auth-token": token } }
          );

          localStorage.setItem("auth-token", token);
          setUser({ token, user: userRes.data });
        }
        return;
      } catch (err) {
        console.error("Something went wrong with fetching user data: " + err);
      }

    }

    checkLoggedIn();
  }, [])

  useEffect(() => {
    if (user?.token !== undefined) localStorage.setItem("auth-token", user.token)
  }, [user])
  return (
    <>
      <UserContext.Provider value={{ user, setUser }}>
        <Router>
          <Switch>
            <Route path="/" exact> <TestSearch /> </Route>
            <Route path="/take/:testName"> <TestTake /> </Route>


            <Route path="/login"> <Login /> </Route>
            <Route path="/register"> <Register /> </Route>

            <Route path="/results"> <Results /> </Route>

            <Route path="/trainer/select"> <TrainerSelect /> </Route>
            <Route path="/trainer/:trainerId"> <Trainer /> </Route>
            <Route path="/explanations/:trickId"> <Exaplanation /></Route>

            <Route path="/guides"> <Guides /> </Route>
            <Route path="/resources"> <Resources /> </Route>

          </Switch>
        </Router>
      </UserContext.Provider>
    </>
  );
}

export default App;