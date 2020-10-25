import React, { useState } from 'react'
import Generators from './Generators'

import './Trainer.css'
import Navbar from '../Navbar'

import { Table } from 'react-bootstrap'

export default function TrainerSelect() {

    const [search, setSearch] = useState("");
    const [infinite, setInfinite] = useState(true)
    return (
        <div>
            <Navbar />
            <div className="trainer-select">
                <h1>Select a trainer (BETA)</h1>
                <input type="checkbox" className="form-control infinite-toggle" id="infinite-toggle"
                    style={{ width: "1.5rem", height: "1.5rem" }}
                    checked={infinite} onChange={() => setInfinite(prev => !prev)} />
                <label htmlFor="infinite-toggle" className="infinite-toggle" style={{ fontSize: "1.5rem" }}>Infinite mode</label>

                <input type="text" className="form-control trainer-search" placeholder="Search"
                    value={search} onChange={e => setSearch(e.target.value)} />

                <Table striped bordered hover style={{ width: "90%", margin: "0 auto" }}>
                    <thead>
                        <tr>
                            <td> <h1>Trick</h1> </td>
                            <td> <h1>Best time</h1> </td>
                            <td> <h1>Explanation</h1> </td>
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
                                            <td><a href={"/trainer/" + i + "?mode=" + (infinite ? "infinite" : "timed")} key={i}>{gen.name}</a></td>
                                            <td>None</td>
                                            {/* If there is an explanation checkmark else X */}
                                            <td>{gen.explanationFile
                                                ? <a href={"/explanations/" + i}>
                                                    <span role="img" aria-label="checkmark">&#9989;</span>
                                                </a>
                                                : "\u274C"}
                                            </td>
                                        </tr>
                                    )
                                })
                        }
                    </tbody>
                </Table>

            </div>
        </div>
    )
}
