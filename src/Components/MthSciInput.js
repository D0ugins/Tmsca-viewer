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

    const update = (val) => {
        setSelected(val);
        setAnswer(data.id, val);
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
        states[selected] = "selected"
    }

    return (
        <div id={"container"+data.id}>
            {data.choices.map((input, i) => {
                return (
                <div id={`box${data.id}${map[i]}`} key={`${data.id}${i}`} className={states[map[i]]} style={{
                    "position": "absolute",
                    "top": input.top + percent(.1),
                    "left": input.left - percent(2.25),
                    "width": percent(2.5),
                    "height": input.width + percent(.5)
                }}>
                    <input type="radio" id={`input${data.id}${map[i]}`} className="mthsci-input" style={{
                        "opacity": "0",
                        "position": "absolute",
                        "top": "0",
                        "left": "0",
                        "width": percent(4),
                        "height": percent(4),
                        "transform": "translate(-10%,-25%)"
                    }}
                    name={data.id} value={map[i]} key={`${data.id}${map[i]}`} onClick={e => update(e.target.value)}/>
                </div>
                )
            })}
        </div>
    )
}