import React, { useState, useContext } from 'react'
import Axios from 'axios'

import './Login.css'
import UserContext from '../../Context/UserContext'
import Navbar from '../Navbar'
import ErrorMessage from '../ErrorMessage'

export default function Login() {

    const { setUser } = useContext(UserContext)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(undefined)

    const logIn = async (e) => {
        e.preventDefault()
        try {
            const res = await Axios.post(`/api/users/login`, {
                username,
                password
            })
            if (res.status === 200) {
                setUser(res.data)
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
            <form className="login-container" onSubmit={e => logIn(e)}>
                <h1 className="login-header">Log in to save test results</h1>
                <hr />
                <div className="form-group">
                    <input type="text" className="form-control" id="username-input" value={username} placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}></input>

                    <input type="password" className="form-control" id="password-input" value={password} placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}></input>
                </div>
                <button className="btn btn-success">Log in</button>
            </form>
        </>

    )
}
