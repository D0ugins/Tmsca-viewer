import React, { useState, useEffect } from 'react'
import './TestInput.css'

export default function TestInput({ data, setAnswer, gradeState = "", correct = "", old = ""}) {

    const [value, setValue] = useState("")
    
    // Makes sure only valid characters and that nothing was removed
    const validate = (val) => {
        let reg = new RegExp('^[-]?[0-9/. ]*$');
        let old = value;

        return (reg.test(val) && val.length > old.length)
    }
    
    // Sets inputs value and updates answer list from parent
    const update = (e) => {
        var valid = validate(e.target.value);
        if (valid) {setAnswer(data.id, e.target.value); setValue(e.target.value)};
    }

    // Gets width of screen (d is direction width/height)
    const percent = (p, d) => {
        if (d === "w") return window.innerWidth * (p/100);
        else return window.innerHeight * (p/100);
    }

    // Positions and sizes elements 
    var styles = {
            "position": "absolute", 
            "left": data.left - percent(1.5, "w"), 
            "top": data.top + percent(0.25, "h"),
            "width": data.width - percent(1.5, "w"),
            "height": percent(1.8, "w") + "px",
            "fontSize": document.querySelector(".pdf-page span").style.fontSize.slice(0, -2) - 2
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
            setValue(old + gradeState === "wrong" ? ` Correct: ${answer}` : `Correct: ${answer}`);
        }
    // eslint-disable-next-line
    }, [gradeState])
    return (
        <input type="text" id={`input${data.id}`} className={"test-input " + gradeState} style={styles} value={value} onChange={e => update(e)} autoComplete="off"/>
    )
}