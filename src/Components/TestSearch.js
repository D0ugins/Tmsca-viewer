import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './TestSearch.css'

export default function TestSearch({ setTest }) {

    const [type, setType] = useState("Number Sense")
    const [year, setYear] = useState("19-20");
    const [nums, setNums] = useState([''])
    const [num, setNum] = useState(nums[0])
    const [message, setMessage] = useState("")

    useEffect(() => {
        
        // Creates array for test numbers 1-13
        var base = []
        for (let i = 1; i <= 13; i++) {base.push(i.toString())}

        // List of all the non standard 1-13 tests for each year
        const extras = {
            "19-20": ['Kickoff', 'Regional'],
            "18-19": ['Kickoff', 'Gear up', 'Tune up', 'Regional', 'State'],
            "17-18": ['Regional', 'State']
        };

        setNums(base.concat(extras[year]));

    }, [year])

    const findTest = () => {
        
        // Check for invalid test name
        if (!nums.includes(num)) { 
            setMessage("Please enter a valid test"); 
            return
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
        const type_code = map[type]
        const test_name = `MS${type_code}${test_num} ${year}`

        // setTest function from parent component
        setTest({
            "tpath": `${process.env.PUBLIC_URL}/tests/${type}/${type} ${year}/${test_name}.pdf`,
            "jpath": `${process.env.PUBLIC_URL}/keys/${type}f/${type} ${year}/${test_name} Key Formatted.json`,
            "name": test_name,
            "type": type,
        })
    }

    return (
        <div className="select-container">
            <div className="test-select">
                
                <h1>Select test</h1> 
                <hr/>
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
                        <option value="19-20">2019-20</option>
                        <option value="18-19">2018-19</option>
                        <option value="17-18">2017-18</option>
                    </select>
                </div>

                <div className="arg">
                    <label htmlFor="num">Choose test number: </label>
                    <input name="num" value={num} onChange={e => setNum(e.target.value)} list="nums" />
                    <datalist id="nums">
                        {nums.map(n =>
                            <option value={n} key={n} />
                        )}
                    </datalist>
                </div>
            
            </div>
            
            <Link to={nums.includes(num) ? "/Tmsca-viewer/view" : "#"} onClick={findTest}
            className="btn btn-success search-button">View test</Link>

            <Link to={nums.includes(num) ? "/Tmsca-viewer/take" : "#"} onClick={findTest}
            className="btn btn-success search-button" hidden={type === "Calculator"} disabled={type !== "Number sense"}>Take test</Link>
            
            <div className="alert alert-danger" hidden={!message}>{message}</div>
        </div>
    );

}