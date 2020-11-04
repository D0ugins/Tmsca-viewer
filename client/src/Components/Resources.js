import React from 'react'
import Navbar from './Navbar'
import './Resources.css'

export default function Resources() {

    let base = process.env.PUBLIC_URL + "/resources/"
    return (
        <>
            <Navbar />
            <div className="resource-title">Number Sense</div>
            <hr />
            <div className="resources-container">
                <ul className="resource">
                    <li><a href="https://bryantheath.com/middle-school-number-sense-practice-tests/">
                        Additional Number Sense Practice Tests</a></li>
                    <li><a href={base + "BeginnerNumberSenseTricks.pdf"}>Beginner Number Sense Tricks</a></li>
                </ul>
                <ul className="resource">
                    <li><a href="http://mathninja.org/math-team/number-sense-video-lesson-and-workbook/pages-4-through-24/">Number Sense Tricks + videos</a></li>
                    <li><a href={base + "NumberSesnseTricks1.pdf"}>Number Sense Tricks 1</a></li>
                    <li><a href={base + "NumberSesnseTricks2.pdf"}>Number Sense Tricks 2</a></li>
                    <li><a href={base + "NumberSesnseTricks3.pdf"}>Number Sense Tricks 3</a></li>
                </ul>
                <ul className="resource">
                    <li><a href={base + "NumberSensePractice1.pdf"}>Number Sense Practice 1</a></li>
                    <li><a href={base + "NumberSensePractice2.pdf"}>Number Sense Practice 2</a></li>
                </ul>
            </div>
        </>
    )
}