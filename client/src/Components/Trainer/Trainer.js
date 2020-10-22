import React, { useState } from 'react'
import Generators from './Generators'
import Question from './Question'
import Navbar from '../Navbar'
import './Trainer.css'

export default function Trainer() {

    const parseTrainers = (gens) => {
        let generators = [];
        gens.map(gen => {
            if (gen.presets) return Object.keys(gen.presets).map(preset => {
                return generators.push({ ...gen, name: gen.name + preset, preset: gen.presets[preset] });
            })
            else return generators.push(gen);
        })
        return generators;
    }

    const [trainer] = useState(() => {
        let id = window.location.pathname.split("/").slice(-1)[0]
        if (!isNaN(parseInt(id))) {
            return parseTrainers(Generators)[parseInt(id)]
        }
        else return null
    })
    const [search, setSearch] = useState("");

    return (
        <div>
            <Navbar />
            {!trainer
                ? <div className="trainer-select">
                    <h1>Select a trainer (BETA)</h1>
                    <input type="text" className="form-control trainer-search" placeholder="Search"
                        value={search} onChange={e => setSearch(e.target.value)} />
                    {parseTrainers(Generators)
                        .filter(gen =>
                            gen.name.toLowerCase().includes(search.toLowerCase()) || !search)
                        .map((gen, i) => {
                            return <a href={"trainer/" + i} key={i}>{gen.name}</a>
                        })}
                </div>
                : <div className="question-container">
                    <h1>{trainer.name}</h1>
                    <hr />
                    <Question generator={trainer} />
                </div>
            }
        </div>
    )
}
