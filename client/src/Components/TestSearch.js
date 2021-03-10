import React, { useState, useEffect } from 'react';
import './TestSearch.css'
import Navbar from "./Navbar.js"

import { getTestPath, nameMap } from '../utils/testNames'
const getNums = (level, year) => {

    // Years for elementary tests
    if (level === "EL") {
        if (year === "20-21") return ["Spring online"]
        return []
    }

    if (year === "20-21") {
        return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', 'Kickoff', 'Gear up'];
    }
    // Creates array for test numbers 1-13
    let base = []
    for (let i = 1; i <= 13; i++) { base.push(i.toString()) }

    // List of all the non standard 1-13 tests for each year
    const extras = {
        "19-20": ['Kickoff', 'Regional'],
        "18-19": ['Kickoff', 'Gear up', 'Tune up', 'Regional', 'State'],
        "17-18": ['Regional', 'State']
    };

    return base.concat(extras[year]);

}

export default function TestSearch() {

    const [level, setLevel] = useState(localStorage.getItem('level') || "MS")
    const [type, setType] = useState(localStorage.getItem('type') || "NS")
    const [year, setYear] = useState(localStorage.getItem('year') || "19-20");
    const [nums, setNums] = useState(getNums("19-20", "MS"))
    const [num, setNum] = useState('')

    useEffect(() => {
        setNums(getNums(level, year))
    }, [level, year])

    const findTest = (action) => {

        // Check for invalid test name
        if (!nums.includes(num)) {
            return "#";
        }

        // Checks if test number is a word (ie Regional, State) and if so gets the corresponding code
        const test_num = isNaN(parseInt(num)) ? nameMap[num] : num
        const test_name = `${level}${type}${test_num} ${year}`

        if (action === "view") return `${process.env.PUBLIC_URL}/tests/${getTestPath(test_name)}.pdf`
        return `/take/${test_name.replace(/ /g, "_")}?mode=${action}`
    }

    const brokentest = () => {
        // Certain tests formatting are just broken beyond repair you cant take those tests
        if (num === "Kickoff" && year === "18-19" && (type === "SC")) return true;
        if (level === "EL" && type === "CA") return true;

        return false;
    }

    const checkInvalid = () => {
        if (!nums.includes(num)) {
            // Focus num input box and give it invalid style
            document.getElementById("num").focus();
            // Style gets reset on change
            document.getElementById("num").className = "invalid"
        }
    }

    useEffect(() => {
        localStorage.setItem('level', level);
        localStorage.setItem('type', type);
        localStorage.setItem('year', year);
    }, [level, type, year])

    return (
        <>
            <Navbar />
            <div className="select-container">
                <div className="test-select">

                    <h1>Select test</h1>
                    <hr />

                    <div className="arg">
                        <label htmlFor="level">Choose grade level: </label>
                        <select name="level" value={level} onChange={e => setLevel(e.target.value)}>
                            <option value="MS">Middle</option>
                            <option value="EL">Elementary</option>
                        </select>
                    </div>

                    <div className="arg">
                        <label htmlFor="type">Choose test type: </label>
                        <select name="type" value={type} onChange={e => setType(e.target.value)}>
                            <option value="NS">Number Sense</option>
                            <option value="MA">Math</option>
                            <option value="SC">Science</option>
                            <option value="CA">Calculator</option>
                        </select>
                    </div>

                    <div className="arg">
                        <label htmlFor="year">Choose test year: </label>
                        <select name="year" value={year} onChange={e => setYear(e.target.value)}>
                            <option value="20-21">2020-21</option>
                            <option value="19-20">2019-20</option>
                            <option value="18-19">2018-19</option>
                            <option value="17-18">2017-18</option>
                        </select>
                    </div>

                    <div className="arg">
                        <label htmlFor="num">Choose test number: </label>
                        {/* Onchange update num and reset classname */}
                        <input id="num" name="num" value={num} onChange={e => { setNum(e.target.value); e.target.className = "" }} list="nums"
                            className={""} autoComplete="off" />
                        <datalist id="nums">
                            {nums.map(n =>
                                <option value={n} key={n || ""} />
                            )}
                        </datalist>
                    </div>

                </div>

                <a href={findTest("view")} onClick={checkInvalid}
                    className="btn btn-success search-button">View test</a>

                <a href={findTest("take")} onClick={checkInvalid}
                    className="btn btn-success search-button" hidden={brokentest()}>Take test</a>

                <a href={findTest("practice")} onClick={checkInvalid}
                    className="btn btn-success search-button" hidden={brokentest()}>Practice test</a>

            </div>
        </>
    );

}