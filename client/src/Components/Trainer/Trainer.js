import React, { useState, useEffect, useContext, useRef } from 'react'

import Generators from './Generators'
import Navbar from '../Navbar'
import './Trainer.css'
import './Qtimer'
import Qtimer from './Qtimer'
import './Question.css'
import UserContext from '../../Context/UserContext'

import { useParams } from 'react-router-dom'
import { Button, Alert } from 'react-bootstrap'
import { MathComponent } from 'mathjax-react'
import Axios from 'axios'


export default function Trainer() {

    const { trainerId } = useParams()
    const { user } = useContext(UserContext)

    const randInRange = (min, max) => Math.floor(Math.random() * (max - min)) + min + 1;
    const newTrainer = () => {
        let base = Generators[randInRange(0, Generators.length - 1)]
        base.realName = base.name
        base.name = "Random"
        return base
    }

    const [random] = useState(trainerId === "random")
    const [trainer, setTrainer] = useState(() => {
        let id = parseInt(trainerId)
        if (!isNaN(id)) {
            return Generators[id]
        }
        else if (trainerId === "random") {
            return newTrainer()
        }
        else return window.location.pathname = "/trainer/select"
    })

    const preset = trainer.preset || []
    const [answer, setAnswer] = useState("")
    const [startedTime, setStartedTime] = useState(Date.now())
    const [prev, setPrev] = useState("")
    const [question, setQuestion] = useState(trainer.generate(preset))
    const [answers, setAnswers] = useState([])
    const [score, setScore] = useState(0)

    const [best, setBest] = useState(0)

    // Ref for box where you put wheter or not last question was correct
    const prevRef = useRef(null)

    const mode = window.location.search.split("=")[1] === "timed" ? "timed" : "infinite"

    // In infinite mode default started to true
    const [started, setStarted] = useState(mode === "infinite")
    const [done, setDone] = useState(false)

    const validate = (val) => {
        // Make sure answer is only valid characters
        let reg = new RegExp('^[-]?[0-9/. ]*$');
        return (reg.test(val))
    }

    const updateAnswer = (val) => {
        if (validate(val)) setAnswer(val)
    }

    const reset = () => {
        setAnswer("");
        if (random) {
            let newtrainer = newTrainer()
            setTrainer(newtrainer)
            setQuestion(newtrainer.generate(newtrainer.preset || []))
        } else {
            setQuestion(trainer.generate(preset));
        }

        setStartedTime(Date.now())
    }

    const checkAnswer = (e) => {
        e.preventDefault();
        if (answer.trim() === question.answer.toString()) {
            // If answer was correct update the previous box to show the time
            prevRef.current.style.color = "green"
            setPrev("Answered in: " + ((Date.now() - startedTime) / 1000).toFixed(2) + " seconds")

            // If in timed mode add one to the score
            if (mode === "timed") setScore(score => score + 1)
        }
        else {
            // If wrong set prev box to what the correct answer was
            prevRef.current.style.color = "red"
            setPrev(answer + " CORRECT: " + question.answer)

            // If in timed mode decrease score
            if (mode === "timed") setScore(score => score - 1)
        }

        // Update answers array to show averages and stuff
        setAnswers(prev => {
            return [
                ...prev, {
                    question: question.question,
                    correctAnswer: question.answer,
                    correct: answer.trim() === question.answer.toString(),
                    answer: answer.trim(),
                    time: (Date.now() - startedTime) / 1000.0
                }
            ]
        })

        // Reset input box and stuff
        reset()
    }

    const startTimed = () => {
        // Reset all the stuff to start timed mode
        reset()
        setAnswers([])
        setPrev("")
        setScore(0)
        setDone(false)
        setStarted(true)
    }

    const getTime = () => {
        // Returns the total time spent
        let time = answers.reduce((acc, cur) => { return acc + cur.time }, 0)
        return time.toFixed(2)
    }

    const endTest = () => {
        if (user?.user) {
            // If user is logged in and time is less than their best, save it
            const time = getTime()
            if (time < best || !best) {
                setBest(time)
                Axios.post('/api/trainer/bestTimes', {
                    trick: trainer.name,
                    time
                }, { headers: { "x-auth-token": user.token } })
            }
        }
        setDone(true)
        setStarted(false)
    }

    useEffect(() => {
        // Once score is greater than 10 end the test
        if (score >= 10 && mode === "timed") {
            endTest()
        }
        // eslint-disable-next-line
    }, [score, mode])

    useEffect(() => {
        // Load the best time from the database
        const loadBest = async () => {
            setBest((await Axios.get('/api/trainer/bestTimes', {
                params: { trick: trainer.name },
                headers: { "x-auth-token": user.token }
            })).data.time)
        }

        if (mode === "timed" && user?.user) {
            loadBest()
        }
    }, [mode, trainer.name, user.token, user.user])

    return (
        <div>
            <Navbar />
            <div className="question-container">
                {trainer.name} {!random ? <a style={{ fontSize: "2vw" }} href={"/explanations/" + trainerId}>Learn</a> : ""}
                <hr />
                <form onSubmit={e => checkAnswer(e)} className="question-container">

                    {
                        started ? <>
                            {random ? <>
                                <span style={{ fontSize: "2rem" }}>{trainer.realName} </span>
                                <a style={{ fontSize: "2vw" }} href={"/explanations/" + trainer.id}>Learn</a>
                            </> : ""}
                            <h3 ref={prevRef}>{prev}</h3>
                            <div className="math-container"><MathComponent tex={question.question}></MathComponent></div>
                            <input value={answer} onChange={e => updateAnswer(e.target.value)}
                                name="answer" autoComplete="off" className="question-input"></input>
                            <Qtimer startedTime={startedTime} />
                        </> : ""
                    }
                </form>
                {
                    mode === "timed"
                        ? !started
                            ? !done ? <div>
                                <h1>Complete 10 questions as quickly as possible</h1>
                                <br />
                                <h2>Current best: {best || "None"}</h2>
                                <Button style={{ fontSize: ".5em", width: "10%" }} onClick={startTimed}>Start</Button>

                            </div> : <div>
                                    {getTime < best || !best ?
                                        <Alert variant="success"
                                            style={{ width: "80%", fontSize: "1.5rem", margin: "2% auto" }}>
                                            New best time!
                                        </Alert> : ""}
                                    <p>Your time: {getTime()}</p>
                                    <p>Best time: {best || "None"}</p>
                                    <Button style={{ fontSize: ".5em", width: "10%" }} onClick={startTimed}>Start Again</Button>
                                </div>

                            : <div>
                                Score: {score} / 10
                            </div>

                        : answers === undefined || answers.filter(ans => ans.correct).length === 0 ? ""
                            : <div className="trainer-stats">
                                <span>
                                    Average time: {(answers
                                        .filter(ans => ans.correct)
                                        .reduce((acc, cur) => {
                                            return acc += cur.time
                                        }, 0) / answers.filter(ans => ans.correct).length).toFixed(2)}
                                </span>
                                <span>
                                    Accuracy: {(
                                        ((answers.filter(ans => ans.correct).length * 1.0 / answers.length) * 100).toFixed(1)
                                    )}%
                                    </span>
                            </div>
                }

            </div>
        </div>
    )
}
