import React from 'react'
import { Link } from "react-router-dom";
import './Navbar.css'

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-ld bg-light">
            <div className="navbar-collapse">
                <div className="navbar-nav">
                    <Link className="navbar-brand" to="/Tmsca-viewer/">Search</Link>
                    <Link className="nav-item nav-link" to="/Tmsca-viewer/resources">Resources</Link>
                </div>
            </div>
        </nav>
    )
    
}