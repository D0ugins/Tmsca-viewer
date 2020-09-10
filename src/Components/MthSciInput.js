import React, { useState } from 'react'
import './MthSciInput.css'


export default function MthSciInput ({data, setAnswer , correct="", gradeState="", old=""}) {
    const [selected, setSelected] = useState("")

    // Gets width screen (d is direction width/height)
    const percent = (p) => {
        return window.innerWidth * (p/100);
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
        if (gradeState === ""){
            if (val === selected) val = ""
            setSelected(val);
            setAnswer(data.id, val);
        }
    }

    var states = {
        "A": "",
        "B": "",
        "C": "",
        "D": "",
        "E": ""
    }

    // Calculates what styles go on which choices
    if (gradeState !== "") {
        if (old !== "" ) {
            if (old === correct) states[old] = "mthsci-correct"
            else {
                states[old] = "mthsci-wrong"
                states[correct] = "mthsci-missed-correct"
            }
        }
        else {
            states[correct] = "mthsci-missed-correct"
        }
    }
    
    else {
        for (var i in states) states[i] = "unselected"
        states[selected] = "selected"
    }

    // Uses divs insread of radios because of easier styling and unselecting
    return (
        <div id={"container"+data.id}>
            {data.choices.map((input, i) => {
                let choice = map[i]
                return (
                <div id={`box${data.id}${choice}`} key={`${data.id}${choice}`} className={states[choice]} data-value={choice} style={{
                    "position": "absolute",
                    "top": input.top + percent(heightmap[choice] / 100),
                    "left": input.left - percent(2.33),
                    "width": percent(2.75),
                    "height": percent(2.25)
                }} onClick={e => update(e.target.dataset.value)}>
                </div>
                )
            })}
        </div>
    )
}