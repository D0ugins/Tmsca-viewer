import React from 'react'
import Generators from './Generators'
import Question from './Question'
import Navbar from '../Navbar'

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
            <Navbar />
            {parseTrainers(Generators).map(gen => {
                return <div style={{ textAlign: "center", marginBottom: "10%" }} key={gen.name}>
                    <h1>{gen.name}</h1>
                    <Question generator={gen} preset={gen.preset} />
                </div>
            })}
        </div>
    )
}
