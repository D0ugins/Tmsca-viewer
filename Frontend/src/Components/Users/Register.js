import React, { useState, useContext } from 'react'
import Axios from 'axios'

import './Register.css'
import UserContext from '../../Context/UserContext'
import Navbar from '../Navbar'
import ErrorMessage from '../ErrorMessage'

const typeMap = {
    "NS": "Number Sense",
    "MA": "Math",
    "SC": "Science",
    "CA": "Calculator"
}

export default function Register() {

    const { setUser } = useContext(UserContext)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordCheck, setPasswordCheck] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [competitions, setCompetitions] = useState({
        "NS": false,
        "MA": false,
        "SC": false,
        "CA": false
    })

    const [error, setError] = useState(undefined)

    const updateComps = (e) => {
        let next = competitions
        next[e.target.value] = !next[e.target.value]
        // I have no idea why I have to do this but I cant get it to work any other way
        setCompetitions({
            "NS": competitions["NS"],
            "MA": competitions["MA"],
            "SC": competitions["SC"],
            "CA": competitions["CA"]
        })
    }

    const register = async (e) => {
        e.preventDefault()
        try {
            var res = await Axios.post(`http://localhost:5000/api/users/register`, {
                email,
                password,
                passwordCheck,
                firstName,
                lastName,
                competitions
            })
            if (res.status === 200) {
                var user = await Axios.post(`http://localhost:5000/api/users/login`, {
                    email,
                    password
                })
                setUser(user.data)
                window.location.pathname = "/"
            }
        } catch (err) {
            if (err.response.data.msg) { setError(err.response.data.msg); document.documentElement.scrollTop = 0; }
        }

    }

    return (
        <>
            <Navbar />
            <div style={{ width: "80%", margin: "auto", marginTop: "2%", fontSize: "1.25rem" }}>
                <ErrorMessage message={error} clearError={() => setError(undefined)} />
            </div>
            <form className="login-container" onSubmit={e => register(e)}>
                <h1 className="login-header">Create an account to save test results</h1>
                <hr />
                <div className="form-group">
                    <input type="email" className="form-control" id="email-input" value={email} placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}></input>
                    <hr />
                    <input type="password" className="form-control" id="password-input" value={password} placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}></input>

                    <input type="password" className="form-control" id="passwordCheck-input" value={passwordCheck} placeholder="Confirm Password"
                        onChange={(e) => setPasswordCheck(e.target.value)}></input>
                    <hr />
                    <input type="text" className="form-control" id="firstName-input" value={firstName} placeholder="First Name"
                        onChange={(e) => setFirstName(e.target.value)}></input>

                    <input type="text" className="form-control" id="lastName-input" value={lastName} placeholder="Last Name"
                        onChange={(e) => setLastName(e.target.value)}></input>
                    <hr />
                    <div className="comps-container">
                        <div className="comp-labels">
                            {
                                Object.keys(competitions).map(comp => {
                                    return <label htmlFor={comp + "-check"} className="comp-label" key={comp + "-label"}>{typeMap[comp]} </label>
                                })
                            }
                        </div>
                        <div className="comp-boxes">
                            {
                                Object.keys(competitions).map(comp => {
                                    return <input type="checkbox" className="comp-select" id={comp + "-check"} name="comps" value={comp} key={comp + "-input"}
                                        checked={competitions[comp]} onChange={(e) => updateComps(e)} />
                                })
                            }
                        </div>
                    </div>
                </div>
                <button className="btn btn-success">Create Account</button>
            </form>
        </>

    )
}
