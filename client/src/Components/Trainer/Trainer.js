import React, { useState } from 'react'
import Generators from './Generators'
import Question from './Question'
import Navbar from '../Navbar'

export default function Trainer() {

    const [started, setStarted] = useState(false)

    const parseTrainers = (gens) => {
        let generators = []
        gens.map(gen => {
            if (gen.presets) return Object.keys(gen.presets).map(preset => {
                return generators.push({ ...gen, name: gen.name + preset, preset: gen.presets[preset] })
            })
            else return generators.push(gen)
        })
        return generators
    }

    return (
        <div>
            <Navbar />
            {!started
                ? <div className="trainerselect">
                    {parseTrainers(Generators).map(gen => {
                        return <div>{gen.name}</div>
                    })}
                </div>
                : ""}
        </div>
    )
}
