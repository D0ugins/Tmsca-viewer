import React, { useState } from 'react'
import Generators from './Generators'
import Question from './Question'
import Navbar from '../Navbar'
import './Trainer.css'

import { Table } from 'react-bootstrap'
import { useParams } from 'react-router-dom'

export default function Trainer() {

    const { trainerId } = useParams()
    const [trainer] = useState(() => {
        let id = parseInt(trainerId)
        if (!isNaN(id)) {
            return Generators[id]
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
                    <Table striped bordered hover style={{ width: "90%", margin: "0 auto" }}>
                        <thead>
                            <tr>
                                <td> <h1>Trick</h1> </td>
                                <td> <h1>Best time</h1> </td>
                                <td> <h1>Rank</h1> </td>
                                <td> <h1>Explanation</h1></td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Generators
                                    .filter(gen =>
                                        gen.name.toLowerCase().includes(search.toLowerCase()) || !search)
                                    .map((gen, i) => {
                                        return (
                                            <tr key={i}>
                                                <td><a href={"/trainer/" + i} key={i}>{gen.name}</a></td>
                                                <td>None</td>
                                                <td>None</td>
                                                {/* If there is an explanation checkmark else X */}
                                                <td>{gen.explanationFile ? <a href={"/explanations/" + i}>&#9989;</a> : "\u274C"}</td>
                                            </tr>
                                        )
                                    })
                            }
                        </tbody>
                    </Table>

                </div>
                : <div className="question-container">
                    {trainer.name} <a style={{ fontSize: "2vw" }} href={"/explanations/" + trainerId}>Learn</a>
                    <hr />
                    <Question generator={trainer} />
                </div>
            }
        </div>
    )
}
