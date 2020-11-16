import React, { useState, useEffect } from 'react'

export default function CaInput({ data, setAnswer, int, gradeState = "", correct = "", old = "" }) {

    const [base, setBase] = useState("")
    const [exponent, setExponent] = useState("")

    // Makes sure only valid characters and that nothing was removed
    const validate = (val) => {
        return /^[-]?[0-9/. ]*$/.test(val)
    }

    // Sets inputs value and updates answer list from parent
    const updateBase = (e) => {
        if (gradeState === "") {
            var valid = validate(e.target.value, false);
            if (valid) { setAnswer(data.id, { base: e.target.value, exponent }); setBase(e.target.value) };
        }
    }

    const updateExp = (e) => {
        if (gradeState === "") {
            var valid = validate(e.target.value, true);
            if (valid) { setAnswer(data.id, { base, exponent: e.target.value }); setExponent(e.target.value) };
        }
    }

    // Gets width of screen (d is direction width/height)
    const percent = (p) => {
        return window.innerWidth * (p / 100);
    }

    // Positions and sizes elements 
    let styles = {
        position: "absolute",
        left: data.left - percent(1.5),
        top: data.top - percent(.25),
        width: (data.width - percent(1.5)) / (int ? 1 : 1.66),
        height: percent(1.8) + "px",
        fontSize: ((window.innerWidth / 54.34).toFixed(1) - 2),
        padding: '3px'
    }

    let exponent_styles = {
        ...styles,
        left: styles.left + styles.width + percent(3.5),
        width: percent(2),
        top: styles.top - percent(1),
        fontSize: styles.fontSize / 2,
        padding: ".5px"
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

            setBase(old?.base ? `${old.base} Correct: ${correct.base}` : `Correct: ${correct.base}`);
            setExponent(old?.exponent ? `${old.exponent} | ${correct.exponent}` : `${correct.exponent}`);
        }
        // eslint-disable-next-line
    }, [gradeState])

    var gradeClass = ` ns-${gradeState}`
    return (
        <>
            <input type="text" id={`base${data.id}`} className={"form-control test-input" + gradeClass}
                style={styles} value={base} onChange={e => updateBase(e)}
                autoComplete="off" />
            {
                !int
                    ?
                    <>
                        <span style={{
                            ...styles,
                            left: styles.left + styles.width + percent(.5),
                            top: styles.top - percent(.5)
                        }}>x10</span>
                        <input type="text" id={`exponent${data.id}`} className={"form-control test-input" + gradeClass}
                            style={exponent_styles} value={exponent} onChange={e => updateExp(e)}
                            autoComplete="off" />
                    </> : ""
            }

        </>
    )
}