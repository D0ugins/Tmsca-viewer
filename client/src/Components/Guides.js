import React from 'react'
import Navbar from './Navbar'

export default function Guides() {
    return (
        <div>
            <Navbar />
            <div style={{ marginTop: "5%", textAlign: "center" }}>
                <h1 style={{ fontSize: "3rem" }}>Math</h1>
                <hr />
                <div style={{ textAlign: "center", fontSize: "2rem", marginBottom: "3%" }}>
                    <a href="https://docs.google.com/document/d/1FCT2Q_hY0lL7t5x3yJtHRSZa9jU3llSteWEWJKlFUBQ/edit?usp=sharing"
                        style={{ marginRight: "5%" }}>
                        Math Kickoff 20-21
                    </a>
                    <a href={process.env.PUBLIC_URL + "/Explanations/Math/MSMA KO 20-21 Explanations.pdf"} download>(Download)</a>
                </div>
                <div style={{ textAlign: "center", fontSize: "2rem", marginBottom: "5%" }}>
                    <a href="https://docs.google.com/document/d/1x5Gyf7rgwUxkSj4vZvn6dGmMpfeIDJbamJq6U0DNzlo/edit?usp=sharing"
                        style={{ marginRight: "5%" }}>
                        Math Test 1 20-21
                    </a>
                    <a href={process.env.PUBLIC_URL + "/Explanations/Math/MSMA1 20-21 Explanations.pdf"} download>(Download)</a>
                </div>

                <div style={{ textAlign: "center", fontSize: "2rem", marginBottom: "5%" }}>
                    <a href="https://docs.google.com/document/d/1WBgqvuqrGtXX_SlqA1X41hRajkEd6GZHZPqEwYDh_y4/edit?usp=sharing"
                        style={{ marginRight: "5%" }}>
                        Math Test 2 20-21
                    </a>
                    <a href={process.env.PUBLIC_URL + "/Explanations/Math/MSMA2 20-21 Explanations.pdf"} download>(Download)</a>
                </div>

                <h1 style={{ fontSize: "3rem" }}>Number Sense</h1>
                <hr />
                <div style={{ textAlign: "center", fontSize: "2rem" }}>
                    <a href="https://docs.google.com/document/d/18YmPXB59dQh_l5DbAvy_NQm4WUZZ-rGsgYiOfIpo_A0/edit?usp=sharing">
                        Number Sense Kickoff 20-21 (WIP)
                    </a>
                </div>


            </div>
        </div>
    )
}
