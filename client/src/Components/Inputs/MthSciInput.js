import React from 'react'
import './MthSciInput.css'


export default function MthSciInput({ data, setAnswer, type, correct = "", gradeState = "", old = "", selected = "", practice = false }) {

    let state = gradeState;
    // Disable "na" and "skipped" gradestate in practice mode
    if (practice && gradeState === "na") state = "";

    // Gets width screen (d is direction width/height)
    const percent = (p) => {
        return window.innerWidth * (p / 100);
    }

    const map = {
        0: "A",
        1: "B",
        2: "C",
        3: "D",
        4: "E"
    }

    // Each letter has a slightly different alignment that works best
    const heightmap = {
        "A": 25,
        "B": 23,
        "C": 25,
        "D": 22,
        "E": 22
    }

    const update = (val) => {
        if (!state) {
            if (val === selected) val = ""
            setAnswer(data.id, val);
        }
    }

    let states = {
        "A": "",
        "B": "",
        "C": "",
        "D": "",
        "E": ""
    }

    // Calculates what styles go on which choices
    if (state) {
        if (old) {
            if (old === correct) states[old] = "mthsci-correct";
            else {
                states[old] = "mthsci-wrong";
                states[correct] = "mthsci-missed-correct";
            }
        }
        else {
            states[correct] = "mthsci-missed-correct";
        }
    }

    else {
        for (const i in states) states[i] = "unselected";
        states[selected] = "selected";
    }

    // Uses divs insread of radios because of easier styling and unselecting
    return (
        <div id={"container" + data.id}>
            {data.choices.map((input, i) => {
                let choice = map[i]
                return (
                    <div id={`box${data.id}${choice}`} key={`${data.id}${choice}`} className={states[choice]} data-value={choice} style={{
                        "position": "absolute",
                        // Slightly different align for math and for choice e
                        "top": input.top + percent(heightmap[choice] / 100 * (type === "Math" ? .3 : 1)),
                        "left": input.left - percent(choice !== "E" ? (type === "Math" ? 2.6 : 2.33) : 2.75),
                        "width": percent(2.75),
                        "height": percent(2.25)
                    }} onClick={e => update(e.target.dataset.value)}>
                    </div>
                )
            })}
        </div>
    )
}