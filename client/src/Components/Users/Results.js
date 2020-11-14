import React, { useState, useEffect, useContext } from 'react'
import Axios from 'axios'
import { Collapse, Card, Button, Form, Table } from 'react-bootstrap'

import UserContext from '../../Context/UserContext'
import './Results.css'
import Navbar from '../Navbar'

export default function Results() {

    const { user } = useContext(UserContext)
    const [results, setResults] = useState([])
    const [open, setOpen] = useState({})
    const [filter, setFilter] = useState("All")

    const updateOpen = (i) => {
        const loadDetails = async (index) => {
            const { _id, type } = results[index]
            const details = await Axios.get("/api/results/details", { params: { result_id: _id, type } })
            setResults(prev => {
                return prev.map((result, i) => {
                    // If at the correct index return result + details, else just return the result
                    if (i === index) {
                        return {
                            ...result,
                            ...details.data,
                        }
                    }
                    else {
                        return result
                    }
                })
            })
        }

        if (!results[i].gradeStates || !results[i].times) {
            loadDetails(i)
        }

        setOpen(prev => { return { ...prev, [i]: !prev[i] } })
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
        /* If test code is number Change it to Test x 
        if it isnt use the map to go from for example REG -> Regional*/
        num = isNaN(parseInt(num)) ? map[num] : 'Test ' + num
        let type = map[name.slice(2, 4)]

        return `${type} ${num} (${year})`
    }

    const parseDate = (s) => {
        // Parses taken at date
        let date = new Date(s)

        let months = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"]

        let month = months[date.getMonth()]

        let day = date.getDate();
        let year = date.getFullYear();
        let hour = (date.getHours() % 12) || 12;
        let min = date.getMinutes().toString().padStart(2, '0');

        return `${month} ${day}, ${year} @ ${hour}:${min}`
    }

    const parseTimes = (t) => {
        // Calculates times for individual questions based on when they were answerd
        let times = Object.entries(t);

        // Sorts questions by the time they were answered at
        let sorted = times.sort((a, b) => {
            if (!a[1]) return 1
            if (!b[1]) return -1
            return a[1] - b[1]
        })
        // Calculates the time the question took based on the question that was answer before it
        times = sorted.map((time, i) => {
            if (time[1] === null) return [time[0], ""]
            if (i === 0) return [time[0], (time[1] / 1000).toFixed(1)]
            return [time[0], ((time[1] - times[i - 1][1]) / 1000).toFixed(1)]
        })

        return Object.fromEntries(times)
    }

    const findGradeStates = (searches, gradeStates) => {
        // Get count of certain grade state
        var total = 0
        for (let search of searches) {
            total += Object.entries(gradeStates).filter(gradeState => gradeState[1].state === search).length
        }

        return total
    }

    const getLast = (states) => {
        if (!states) return []
        let arr = Object.entries(states);
        // Find last question that was answered
        let last = arr.filter(state => {
            return state[1].state !== "na"
        }).pop()[0]
        return parseInt(last)
    }

    const getTestPath = (name) => {
        // Get path of test
        const typeMap = {
            'NS': 'Number Sense',
            'MA': 'Math',
            'SC': 'Science',
            'CA': 'Calculator'
        }
        const type = typeMap[name.slice(2, 4)]
        return `${process.env.PUBLIC_URL}/tests/${type}/${type} ${name.slice(-5)}/${name}.pdf`
    }

    const numCrunchMissed = (states) => {
        if (!states) return 0;
        const nonNumCruch = [
            11, 12, 13, 24, 25, 26, 35, 36, 37, 38, 47, 48, 49, 50, 58, 59, 60, 61, 62, 71, 72, 73, 74
        ]

        return Object.entries(states).filter(state => {
            if (state[1].state === "correct" || state[1].state === "na") return false;
            return !(nonNumCruch.includes(parseInt(state[0])))
        }).length
    }

    const statedGeo = (states) => {
        if (!states) return 0;
        const statedGeo = [
            11, 12, 13, 24, 25, 26, 35, 36, 37, 38, 47, 48, 49, 50, 58, 59, 60, 61, 62, 71, 72, 73, 74
        ]

        return Object.entries(states).filter(state => {
            if (!statedGeo.includes(parseInt(state[0]))) return false
            return state[1].state === "correct"
        }).length
    }

    useEffect(() => {
        const getResults = async () => {
            // Load results from backend
            if (user && user.user) {
                let res = await Axios.get('/api/results', { params: { user_id: user.user._id } })

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
                    ["Number Sense", "Math", "Science", "Calculator", "All"].map(s => {
                        return <Form.Check inline className="result-filter" checked={filter === s} label={s}
                            type="radio" value={s} name="type" key={s + "filter"} onClick={() => {
                                setFilter(s)
                            }} />
                    })
                }
            </div>

            { results.filter((result) => {
                return filter === "All" || result.type === filter
            }).map((result, i) => {
                let { test_name, score, takenAt, gradeStates, times, type } = result

                let groups = []
                let averageTime = 0
                if (times && gradeStates) {
                    switch (type) {
                        case "Number Sense":
                            groups = [20, 40, 60, 80];
                            averageTime = 600;
                            break;
                        case "Calculator":
                            groups = [13, 26, 38, 50, 60, 72, 80];
                            averageTime = 1800;
                            break;
                        case "Math":
                            groups = [12, 25, 38, 50];
                            averageTime = 2400;
                            break;
                        default:
                            groups = [];
                            averageTime = 2400;
                            break;
                    }
                    let last = getLast(gradeStates)
                    groups = groups.filter(group => group <= last)
                    averageTime /= findGradeStates(["correct", "wrong"], gradeStates)

                    times = parseTimes(times)
                }

                const ns = type === "Number Sense"
                const ca = type === "Calculator"

                return (
                    <Card className="result-container" key={"container" + i}>
                        <h1>Score: {score}</h1>
                        <div style={{ textAlign: "left" }}>
                            <a target="_blank" rel="noopener noreferrer" href={getTestPath(test_name)}>
                                <h2>{parseTestName(test_name)}</h2>
                            </a>
                            {/* Shows username if logged in as admin account */}
                            {user.user._id === "5f84b37e35bf0600177f25ce" ? <h3>{result.user.fullName}</h3> : ""}
                            <h4>{parseDate(takenAt)}</h4>
                        </div>
                        <Button variant="primary" style={{ marginTop: "2%" }} onClick={(e) => updateOpen(i, e)}>Questions</Button>
                        <Collapse in={open[i]}>
                            <div>
                                {
                                    gradeStates ? <Table striped bordered hover className="result-stats">
                                        <thead>
                                            <tr style={{ fontSize: "2rem" }}>
                                                <td>Questions answered</td>

                                                {(ns || ca) && <td>Question reached</td>}
                                                {ns && <td>Skipped</td>}
                                                {ca && <td>Number Crunchers Missed</td>}
                                                {ca && <td>Stated and Geometry Correct</td>}

                                                <td>Accuracy</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                                                <td>{findGradeStates(["correct", "wrong"], gradeStates)}</td>

                                                {(ns || ca) && <td>{getLast(gradeStates)}</td>}
                                                {ns && <td>{findGradeStates(["skipped"], gradeStates)}</td>}
                                                {ca && <td>{numCrunchMissed(gradeStates)}</td>}
                                                {ca && <td>{statedGeo(gradeStates)}</td>}

                                                <td>{Math.floor((
                                                    findGradeStates(["correct"], gradeStates) /
                                                    findGradeStates(["correct", "wrong", "skipped"], gradeStates)
                                                ) * 100)}%</td>
                                            </tr>
                                        </tbody>
                                    </Table> : <h3 style={{ marginTop: "2%" }}>Loading...</h3>
                                }

                                {groups.length !== 0 ? <h2>Sections</h2> : ""}
                                {groups ? <Table bordered hover className="group-times">
                                    <thead>
                                        <tr>
                                            {
                                                groups.map((group, i) => {
                                                    if (type === "Science" || group > getLast(gradeStates)) return ""
                                                    if (i === 0) return <td key={group}><h3>1 - {group}</h3></td>
                                                    return <td key={group}> <h3>{groups[i - 1]} - {group}</h3></td>

                                                })
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {
                                                groups.map((group, i) => {

                                                    let section = []
                                                    if (i === 0) section = [0, group]
                                                    else section = [groups[i - 1] - 1, groups[i] - 1]

                                                    let sectionTimes = Object.entries(times).slice(section[0], section[1])
                                                    let time = Math.floor(sectionTimes
                                                        .map(x => parseFloat(x[1]) || 0)
                                                        .reduce((total, time) => total + time))

                                                    let timeString = Math.floor(time / 60) + ":" + (time % 60).toString().padStart(2, '0')

                                                    return <td key={group}><h5>{timeString}</h5></td>

                                                })
                                            }
                                        </tr>
                                    </tbody>
                                </Table> : ""}

                                <hr />
                                {times || gradeStates ? <table className="result-questions">
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

                                            if (type === "Calculator") {
                                                // If there is an exponent its basex10^exponent, otherwise just base
                                                correct = <>{correct.base}{correct.exponent && <>&times; 10<sup>{correct.exponent}</sup></>}</>
                                                answer = <>{answer.base}{answer.exponent && <>&times; 10<sup>{answer.exponent}</sup></>}</>
                                            }

                                            if (answer === "na") answer = ""

                                            return (
                                                <tr className={"result-question result-question-" + state} key={"result-question" + i}>
                                                    <td>{i}</td>
                                                    <td>{answer}</td>
                                                    <td>{correct}</td>
                                                    <td style={times[i] > averageTime * 2 ? { color: "red" } : {}}>
                                                        {times[i]}{times[i] ? "s" : ""}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table> : ""}

                            </div>
                        </Collapse>
                    </Card>
                )
            })}
        </div>
    )
}
