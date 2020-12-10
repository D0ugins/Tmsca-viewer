import React from 'react'

export default function CaInput({ data, setAnswer, int, gradeState = "", correct = { base: "", exponent: "" }, value = { base: "", exponent: "" } }) {

    let { base, exponent } = value

    // Makes sure only valid characters
    const validate = (val) => /^[-]?[0-9/. ]*$/.test(val)

    // Sets inputs value and updates answer list from parent
    const updateBase = (e) => {
        if (gradeState === "") {
            const valid = validate(e.target.value);
            if (valid) { setAnswer(data.id, { base: e.target.value, exponent }); };
        }
    }

    const updateExp = (e) => {
        if (gradeState === "") {
            const valid = validate(e.target.value);
            if (valid) { setAnswer(data.id, { base, exponent: e.target.value }); };
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


    switch (gradeState) {
        case "wrong":
            base = `${base} Correct: ${correct.base}`;
            exponent = `${exponent ?? ""} | ${correct.exponent}`
            break;
        case "skipped":
        case "na":
            base = `Correct: ${correct.base}`;
            exponent = correct.exponent
            break;
        default:
            break;
    }

    const gradeClass = ` ns-${gradeState}`
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