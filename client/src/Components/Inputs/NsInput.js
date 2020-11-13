import React, { useState, useEffect } from 'react'
import './NsInput.css'

export default function NsInput({ data, setAnswer, gradeState = "", correct = "", old = "" }) {

    const [value, setValue] = useState("")

    // Makes sure only valid characters and that nothing was removed
    const validate = (val) => {
        let reg = /^[-]?[0-9/. ]*$/
        let old = value;

        return (reg.test(val) && val.length > old.length)
    }

    // Sets inputs value and updates answer list from parent
    const update = (e) => {
        if (gradeState === "") {
            var valid = validate(e.target.value);
            if (valid) { setAnswer(data.id, e.target.value); setValue(e.target.value) };
        }
    }

    // Gets width of screen (d is direction width/height)
    const percent = (p) => {
        return window.innerWidth * (p / 100);
    }

    // Positions and sizes elements 
    var styles = {
        "position": "absolute",
        "left": data.left - percent(1.5),
        "top": data.top + percent(0.1),
        "width": data.width - percent(1.5),
        "height": percent(1.8) + "px",
        "fontSize": ((window.innerWidth / 54.34).toFixed(1) - 2)
    }

    // Fixes missalignments on mobile
    if (styles.width <= percent(5)) {
        styles.width += percent(.9)
        styles["padding"] = "2px"
        styles.fontSize *= 0.8
    }

    useEffect(() => {
        if (gradeState === "wrong" || gradeState === "skipped" || gradeState === "na") {

            // Deals with esimation problems and ones with multiple right
            var answer = correct
            if (typeof answer === "object") {
                if (data.id % 10 === 0) answer = answer[0] + " - " + answer[1]
                else answer = answer[0]
            }

            // Condition is for wheter or not there should be space
            setValue(gradeState === "wrong" ? `${old} Correct: ${answer}` : `Correct: ${answer}`);
        }
        // eslint-disable-next-line
    }, [gradeState])

    var gradeClass = ` ns-${gradeState}`
    return (
        <input type="text" id={`input${data.id}`} className={"form-control test-input" + gradeClass}
            style={styles} value={value} onChange={e => update(e)}
            autoComplete="off" />
    )
}