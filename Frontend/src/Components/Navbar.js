import React, { useContext } from 'react'
import { Link } from "react-router-dom";
import './Navbar.css'

import UserContext from '../Context/UserContext'

export default function Navbar() {
    const { user, setUser } = useContext(UserContext)

    return (
        <nav className="navbar navbar-expand-lg navbar-ld bg-light">
            <Link className="navbar-brand" to="/">Search</Link>
            <Link className="nav-item nav-link nav" to="/resources">Resources</Link>
            <div style={{ "marginLeft": "auto" }}>
                {
                    user.user ? <button className="nav-item nav-link btn btn-link" onClick={() => {
                        setUser({ token: "", data: undefined });
                    }}>Log Out</button>
                        : <><Link className="nav-item nav-link" to="/login">Log in</Link>
                            <Link className="nav-item nav-link" to="/register">Sign up</Link></>
                }

            </div>
        </nav>
    )

}