import React, { useState, useEffect } from 'react';
import './TestSearch.css'
import Navbar from "./Navbar.js"

const getNums = (year) => {
    // Creates array for test numbers 1-13
    var base = []
    for (let i = 1; i <= 13; i++) { base.push(i.toString()) }

    // List of all the non standard 1-13 tests for each year
    const extras = {
        "19-20": ['Kickoff', 'Regional'],
        "18-19": ['Kickoff', 'Gear up', 'Tune up', 'Regional', 'State'],
        "17-18": ['Regional', 'State']
    };

    if (year === "20-21") {
        return ['Kickoff'];
    }
    else {
        return base.concat(extras[year]);
    }

}

export default function TestSearch() {

    const [type, setType] = useState(localStorage.getItem('type') || "Number Sense")
    const [year, setYear] = useState(localStorage.getItem('year') || "19-20");
    const [nums, setNums] = useState(getNums("19-20"))
    const [num, setNum] = useState('')

    useEffect(() => {
        setNums(getNums(year))
    }, [year])

    const findTest = (action) => {

        // Check for invalid test name
        if (!nums.includes(num)) {
            return "#";
        }

        // Map of human readable options to the codes used in the test names
        const map = {
            'Kickoff': ' KO',
            'Gear up': ' GU',
            'Tune up': ' TU',
            'Regional': ' REG',
            'State': ' STATE',

            'Number Sense': 'NS',
            'Math': 'MA',
            'Science': 'SC',
            'Calculator': 'CA'
        }

        // Checks if test number is a word (ie Regional, State) and if so gets the corresponding code
        const test_num = isNaN(parseInt(num)) ? map[num] : num
        const test_name = `MS${map[type]}${test_num} ${year}`

        if (action === "view") return `${process.env.PUBLIC_URL}/tests/${type}/${type} ${year}/${test_name}.pdf`
        return `/take/${test_name.replaceAll(" ", "_")}`
    }

    const brokentest = () => {
        // Certain tests formatting are just broken beyond repair you cant take those tests
        return num === "Kickoff" && year === "18-19" && (type === "Science")
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
        localStorage.setItem('type', type);
        localStorage.setItem('year', year);
    }, [type, year])

    return (
        <>
            <Navbar />
            <div className="select-container">
                <div className="test-select">

                    <h1>Select test</h1>
                    <hr />
                    <div className="arg">
                        <label htmlFor="type">Choose test type: </label>
                        <select name="type" value={type} onChange={e => setType(e.target.value)}>
                            <option value="Number Sense">Number Sense</option>
                            <option value="Math">Math</option>
                            <option value="Science">Science</option>
                            <option value="Calculator">Calculator</option>
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
                                <option value={n} key={n} />
                            )}
                        </datalist>
                    </div>

                </div>

                <a href={findTest("view")} onClick={checkInvalid}
                    className="btn btn-success search-button">View test</a>

                <a href={findTest("take")} onClick={checkInvalid}
                    className="btn btn-success search-button" hidden={type === "Calculator" || brokentest()}>Take test</a>

            </div>
        </>
    );

}