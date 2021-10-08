import React, { useState, useContext } from 'react'
import Axios from 'axios'

import './Register.css'
import UserContext from '../../Context/UserContext'
import Navbar from '../Navbar'
import ErrorMessage from '../ErrorMessage'
import { typeMap } from '../../utils/testNames'


export default function Register() {

    const { setUser } = useContext(UserContext)

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [passwordCheck, setPasswordCheck] = useState("")
    const [competitions, setCompetitions] = useState({
        "NS": false,
        "MA": false,
        "SC": false,
        "CA": false
    })

    const [error, setError] = useState(undefined)

    const updateComps = (e) => {
        let next = {}
        next[e.target.value] = !competitions[e.target.value]
        setCompetitions((prev => {
            return {
                ...prev,
                ...next
            }
        }))
    }

    const register = async (e) => {
        e.preventDefault()
        try {
            const res = await Axios.post(`/api/users/register`, {
                username,
                password,
                passwordCheck,
                competitions
            })
            if (res.status === 200) {
                const user = await Axios.post(`/api/users/login`, {
                    username,
                    password
                })
                setUser(user.data)
                window.location.pathname = "/"
            }
        } catch (err) {
            if (err.response.data.msg) { setError(err.response.data.msg); document.documentElement.scrollTop = 0; }
            else console.error(err);
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
                    <input type="text" className="form-control" id="username-input" value={username} placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)} required></input>
                    <hr />
                    <input type="password" className="form-control" id="password-input" value={password} placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)} required></input>

                    <input type="password" className="form-control" id="passwordCheck-input" value={passwordCheck} placeholder="Confirm Password"
                        onChange={(e) => setPasswordCheck(e.target.value)} required></input>
                    <hr />
                    <h3>What are your main competitions</h3>
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
