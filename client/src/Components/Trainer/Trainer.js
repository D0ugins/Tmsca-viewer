import React from 'react'
import Generators from './Generators'
import { MathComponent as Math } from 'mathjax-react'

export default function Trainer() {

    const parseTrainers = (gens) => {
        let generators = []
        Object.keys(gens).map(g => {
            let gen = Generators[g]
            if (gen.presets) return Object.keys(gen.presets).map(preset => {
                return generators.push({ ...gen, name: gen.name + preset, preset: gen.presets[preset] })
            })
            else return generators.push(gen)
        })
        return generators
    }


    return (
        <div>
            {parseTrainers(Generators).map(gen => {
                let styles = {
                    "width": "10%"
                }
                return <div key={gen.name}>
                    <h1>{gen.name}</h1>
                    <ul style={{ width: "10%" }}>
                        <li><Math style={styles} tex={gen.generate(gen.preset ?? []).question}></Math></li>
                        <li><Math style={styles} tex={gen.generate(gen.preset ?? []).question}></Math></li>
                    </ul>
                </div>
            })}
        </div>
    )
}
