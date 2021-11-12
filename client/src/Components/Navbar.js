import React, { useContext } from 'react'
import { NavLink } from "react-router-dom";
import './Navbar.css'

import UserContext from '../Context/UserContext'

export default function Navbar() {
    const { user, setUser } = useContext(UserContext)

    return (
        <nav className="navbar navbar-expand-lg navbar-ld bg-light">
            <NavLink className="navbar-brand" to="/">Search</NavLink>
            <NavLink className="nav-item nav-link nav" to="/resources">Resources</NavLink>
            <NavLink className="nav-item nav-link nav" to="/trainer/select">Trainer</NavLink>
            <NavLink className="nav-item nav-link nav" to="/guides">Guides</NavLink>
            {(user && user.user) ? <NavLink className="nav-item nav-link nav" to="/results">Results</NavLink> : ""}
            <div style={{ "marginLeft": "auto" }}>
                {
                    (user && user.user) ?
                        <>
                            <span className="nav-item nav-text" to="/"> Logged in as {user.user.username} </span>
                            <NavLink className="nav-item nav-link" to="/" onClick={() => {
                                setUser({ token: "", data: undefined });
                            }}>Log Out</NavLink>
                        </>
                        : <>
                            <NavLink className="nav-item nav-link" to="/login">Log in</NavLink>
                            <NavLink className="nav-item nav-link" to="/register">Sign up</NavLink>
                        </>
                }

            </div>
        </nav>
    )

}