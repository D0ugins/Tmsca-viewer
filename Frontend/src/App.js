import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Axios from "axios"

import TestSearch from './Components/TestSearch'
import TestTake from './Components/TestTake';
import Resources from './Components/Resources'
import Login from './Components/Users/Login'
import Register from './Components/Users/Register';

import UserContext from './Context/UserContext'

function App() {
  const [user, setUser] = useState({
    token: undefined,
    user: undefined
  })

  // Loads user data based on token from localstorage
  useEffect(() => {
    const checkLoggedIn = async () => {
      let token = localStorage.getItem("auth-token")
      if (token === undefined) { localStorage.setItem("auth-token", ""); token = "" }

      const valid = await Axios.post(`http://localhost:5000/api/users/isTokenValid`, null,
        { headers: { "x-auth-token": token } }
      )

      if (valid.data) {
        const userRes = await Axios.get(`http://localhost:5000/api/users`,
          { headers: { "x-auth-token": token } }
        )
        localStorage.setItem("auth-token", token)
        setUser({ token, user: userRes.data })
      }
    }

    checkLoggedIn()
  }, [])

  useEffect(() => {
    localStorage.setItem("auth-token", user.token)
  }, [user.token])
  return (
    <>
      <UserContext.Provider value={{ user, setUser }}>
        <Router>
          <Switch>
            <Route path="/" exact> <TestSearch /> </Route>
            <Route path="/take"> <TestTake /> </Route>
            <Route path="/resources"> <Resources /> </Route>
            <Route path="/login"> <Login /> </Route>
            <Route path="/register"> <Register /> </Route>
          </Switch>
        </Router>
      </UserContext.Provider>
    </>
  );
}

export default App;