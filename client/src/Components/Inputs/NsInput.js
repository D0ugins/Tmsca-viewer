import React from 'react'
import './NsInput.css'

export default function NsInput({ data, setAnswer, value = "", gradeState = "", correct = "", practice = false }) {

    let state = gradeState;
    // Disable "na" and "skipped" gradestate in practice mode
    if (practice && (gradeState === "na" || gradeState === "skipped")) state = "";

    // Makes sure only valid characters and that nothing was removed
    const validate = (val) => {
        if (practice && state === "") return true;
        const reg = /^[-]?[0-9/. ]*$/
        const old = value;

        return (reg.test(val) && val.length > old.length && state === "")
    }

    // Validates value and updates answer list
    const update = (e) => {
        const valid = validate(e.target.value);
        if (valid) { setAnswer(data.id, e.target.value); };
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
    if (state) {
        let answer = correct;
        if (typeof answer === "object") {
            if (data.id % 10 === 0) answer = answer[0] + " - " + answer[1];
            else answer = answer[0];
        }

        switch (state) {
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

    const gradeClass = ` ns-${state}`
    return (
        <input type="text" id={`input${data.id}`} className={"form-control test-input" + gradeClass}
            style={styles} value={val} onChange={e => update(e)}
            autoComplete="off" />
    )
}