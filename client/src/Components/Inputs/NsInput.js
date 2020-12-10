import React from 'react'
import './NsInput.css'

export default function NsInput({ data, setAnswer, value = "", gradeState = "", correct = "", old = "" }) {

    // Makes sure only valid characters and that nothing was removed
    const validate = (val) => {
        const reg = /^[-]?[0-9/. ]*$/
        const old = value;

        return (reg.test(val) && val.length > old.length)
    }

    // Validates value and updates answer list
    const update = (e) => {
        if (gradeState === "") {
            const valid = validate(e.target.value);
            if (valid) { setAnswer(data.id, e.target.value); };
        }
    }

    // return p percent of the screens width
    const percent = (p) => {
        return window.innerWidth * (p / 100);
    }

    // Positions and sizes elements 
    let styles = {
        "position": "absolute",
        "left": data.left - percent(1.5),
        "top": data.top + percent(0.1),
        "width": data.width - percent(1.5),
        "height": percent(1.8) + "px",
        "fontSize": ((window.innerWidth / 54.34).toFixed(1) - 2)
    }

    // Adjuts styles for small boxes
    if (styles.width <= percent(5)) {
        styles.width += percent(.9)
        styles["padding"] = "2px"
        styles.fontSize *= 0.8
    }


    let val = value;
    // Handles adding correct answer after grading
    if (gradeState) {
        let answer = correct
        if (typeof answer === "object") {
            if (data.id % 10 === 0) answer = answer[0] + " - " + answer[1]
            else answer = answer[0]
        }

        switch (gradeState) {
            case "wrong":
                val = `${value} Correct: ${answer}`;
                break;
            case "skipped":
            case "na":
                val = `Correct: ${answer}`;
                break;
            default:
                val = value
        }
    }

    const gradeClass = ` ns-${gradeState}`
    return (
        <input type="text" id={`input${data.id}`} className={"form-control test-input" + gradeClass}
            style={styles} value={val} onChange={e => update(e)}
            autoComplete="off" />
    )
}