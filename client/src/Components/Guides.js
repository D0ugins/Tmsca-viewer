import React from 'react'
import Navbar from './Navbar'

export default function Guides() {
    return (
        <div>
            <Navbar />
            <div style={{ marginTop: "5%", textAlign: "center" }}>
                <h1 style={{ fontSize: "3rem" }}>Math</h1>
                <hr />
                <div style={{ textAlign: "center", fontSize: "2rem" }}>
                    <a href="https://docs.google.com/document/d/1FCT2Q_hY0lL7t5x3yJtHRSZa9jU3llSteWEWJKlFUBQ/edit?usp=sharing"
                        style={{ marginRight: "5%" }}>
                        Math Kickoff 20-21</a>
                    <a href={process.env.PUBLIC_URL + "/explanations/Math/MSMA KO 20-21 Explanations.pdf"} download>(Download)</a>
                </div>

            </div>
        </div>
    )
}
