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
            if (i === 0) return [time[0], (time[1] / 1000).toFixed(1)]
            return [time[0], ((time[1] - times[i - 1][1]) / 1000).toFixed(1)]
        })

        return Object.fromEntries(times)
    }

    const findGradeStates = (searches, gradeStates) => {
        var total = 0
        for (let search of searches) {
            total += Object.entries(gradeStates).filter(gradeState => gradeState[1].state === search).length
        }

        return total
    }

    const getLast = (states) => {
        if (!states) return []
        let arr = Object.entries(states);
        let last = arr.filter(state => {
            return state[1].state !== "na"
        }).pop()[0]
        return parseInt(last)
    }

    const getTestPath = (name) => {
        const typeMap = {
            'NS': 'Number Sense',
            'MA': 'Math',
            'SC': 'Science',
            'CA': 'Calculator'
        }
        const type = typeMap[name.slice(2, 4)]
        return `${process.env.PUBLIC_URL}/tests/${type}/${type} ${name.slice(-5)}/${name}.pdf`
    }   
    
    useEffect(() => {
        const getResults = async () => {
            if (user && user.user) {
                let res = await Axios.get(
                    '/api/results',
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
                            type="radio" value={s} name="type" key={s + "filter"} onClick={() => {
                                setFilter(s)
                            }} />
                    })
                }
            </div>

            { results ? results.filter((result) => {
                return filter === "All" || result.type === filter
            }).map((result, i) => {
                let { test_name, score, takenAt, gradeStates, times, type } = result

                let groups = type === "Number Sense" ? [20, 40, 60, 80] : (type === "Math" ? [12, 25, 38, 50] : [])
                let last = getLast(gradeStates)

                groups = groups.filter(group => group <= last)

                times = parseTimes(times)
                let averageTime = (type === "Number Sense" ? 600 : 2400) / findGradeStates(["correct", "wrong"], gradeStates)

                return (
                    <Card className="result-container" key={"container" + i}>
                        <h1>Score: {score}</h1>
                        <div style={{ textAlign: "left" }}>
                            <a target="_blank" rel="noopener noreferrer" href={getTestPath(test_name)}>
                                <h2>{parseTestName(test_name)}</h2></a>
                            <h4>{parseDate(takenAt)}</h4>
                        </div>
                        <Button variant="primary" style={{marginTop: "2%"}} onClick={(e) => updateOpen(i, e)}>Questions</Button>
                        <Collapse in={open[i]}>
                            <div>
                                <Table striped bordered hover className="result-stats">
                                    <thead>
                                        <tr>
                                            {
                                                type === "Number Sense" ? <>
                                                <td><h3>Questions answered</h3></td>
                                                <td><h3>Question reached</h3></td>
                                                <td><h3>Skipped</h3></td>
                                                <td><h3>Accuracy</h3></td></>

                                                : <><td><h3>Questions answered</h3></td>
                                                <td><h3>Accuracy</h3></td></>
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            
                                            {
                                                type === "Number Sense" ? <>
                                                    <td><h5>{findGradeStates(["correct", "wrong"], gradeStates)}</h5></td>
                                                    <td><h5>{findGradeStates(["correct", "wrong", "skipped"], gradeStates)}</h5></td>
                                                    <td><h5>{findGradeStates(["skipped"], gradeStates)}</h5></td>
                                                    <td><h5>{Math.floor((
                                                        findGradeStates(["correct"], gradeStates) / 
                                                        findGradeStates(["correct", "wrong", "skipped"], gradeStates)
                                                    ) * 100)}%</h5></td></>
                                                    
                                                    : <><td><h5>{findGradeStates(["correct", "wrong"], gradeStates)}</h5></td>
                                                    <td><h5>{Math.floor((
                                                        findGradeStates(["correct"], gradeStates) / 
                                                        findGradeStates(["correct", "wrong"], gradeStates)
                                                    ) * 100)}%</h5></td></>
                                            }
                                        </tr>
                                    </tbody>
                                </Table>
                                {type !== "Science" ? <h2>Sections</h2> : ""}
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
                                                    <td style={{color: times[i] > averageTime*2 ? "red" : "black" }}>{times[i]}{times[i] ? "s" : ""}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Collapse>
                    </Card>
                )
            }) : <h1>Loading...</h1>}
        </div>
    )
}
