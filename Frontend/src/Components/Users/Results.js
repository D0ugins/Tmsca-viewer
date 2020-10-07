import React, { useState, useEffect, useContext } from 'react'
import Axios from 'axios'
import { Collapse, Card, Button, Form } from 'react-bootstrap'

import UserContext from '../../Context/UserContext'
import './Results.css'
import Navbar from '../Navbar'

export default function Results() {

    const { user } = useContext(UserContext)
    const [results, setResults] = useState([])
    const [open, setOpen] = useState({})
    const [filter, setFilter] = useState("All")

    const updateOpen = (i, e) => {
        setOpen(prev => {
            let next = {}
            next[i] = !prev[i]
            return ({
                ...prev,
                ...next
            })
        })
    }

    const parseTestName = (name) => {
        // Map of codes in test names to human readable names
        const map = {
            ' KO': 'Kickoff',
            ' GU': 'Gear up',
            ' TU': 'Tune up',
            ' REG': 'Regional',
            ' STATE': 'State',

            'NS': 'Number Sense',
            'MA': 'Math',
            'SC': 'Science',
            'CA': 'Calculator'
        }

        const year = "20" + name.slice(-5)
        let num = name.slice(4, -6)
        num = isNaN(parseInt(num)) ? map[num] : 'Test ' + num
        let type = map[name.slice(2, 4)]

        return `${type} ${num} (${year})`
    }

    const parseDate = (s) => {
        let date = new Date(s)

        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        let month = months[date.getMonth()]

        let day = date.getDate();
        let year = date.getFullYear();
        let hour = date.getHours() % 12;
        let min = date.getMinutes();



        return `${month} ${day}, ${year} @ ${hour}:${min}`
    }

    const parseTimes = (t) => {
        let times = Object.entries(t);
        
        // Sorts questions by the time they were answered at
        let sorted = times.sort((a, b) => {
            if (!a[1]) return 1
            if (!b[1]) return -1
            return a[1] - b[1]
        })
        // Calculates the time the question took based on the last time
        times = sorted.map((time, i) => {
            if (time[1] === null) return [time[0], ""]
            if (i === 0) return [time[0], (time[1] / 1000).toFixed(1) + "s"]
            return [time[0], ((time[1] - times[i-1][1]) / 1000).toFixed(1) + "s"]
        })

        return Object.fromEntries(times)
    }

    useEffect(() => {
        const getResults = async () => {
            if (user && user.user) {
                let res = await Axios.get(
                    'http://localhost:5000/api/results',
                    { params: { user_id: user.user._id } })
                
                // Sorts results by date taken
                let data = res.data.sort((a, b) => {
                    return Date.parse(b.takenAt) - Date.parse(a.takenAt)
                })
                setResults(data)
            }
            else return [];
        }
        getResults()
    }, [user])

    return (
        <div>
            <Navbar />
            <div className="result-filters">
                {
                    ["Number Sense", "Math", "Science", "All"].map(s => {
                        return <Form.Check inline className="result-filter" checked={filter === s} label={s}
                            type="radio" value={s} name="type" key={s + "filter"} onClick={(e) => {
                                setFilter(s)
                            }} />
                    })
                }
            </div>

            { results ? results.filter((result) => {
                return filter === "All" || result.type === filter
            }).map((result, i) => {
                let { test_name, score, takenAt, gradeStates, times } = result

                times = parseTimes(times)
                return (
                    <Card className="result-container" key={"container" + i}>
                        <Card.Body>
                            <h1>Score: {score}</h1>
                            <div style={{ textAlign: "left" }}>
                                <h2>{parseTestName(test_name)}</h2>
                                <h4>{parseDate(takenAt)}</h4>
                            </div>
                            <Button variant="primary" onClick={(e) => updateOpen(i, e)}>Questions</Button>
                            <Collapse in={open[i]}>
                                <div>
                                    <table className="result-questions">
                                        <thead>
                                            <tr>
                                                <td>Question</td>
                                                <td>You Answered</td>
                                                <td>Correct Answer</td>
                                                <td>Time</td>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {Object.keys(gradeStates).map(i => {
                                                let { answer, correct, state } = gradeStates[i]

                                                if (Array.isArray(correct)) {
                                                    if (i % 10 === 0) correct = correct[0] + ' - ' + correct[1]
                                                    else correct = correct[0]
                                                }

                                                if (answer === "na") answer = ""

                                                return (
                                                    <tr className={"result-question result-question-" + state} key={"result-question" + i}>
                                                        <td>{i}</td>
                                                        <td>{answer}</td>
                                                        <td>{correct}</td>
                                                        <td>{times[i]}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Collapse>
                        </Card.Body>
                    </Card>
                )
            }) : <h1>Loading...</h1>}
        </div>
    )
}
