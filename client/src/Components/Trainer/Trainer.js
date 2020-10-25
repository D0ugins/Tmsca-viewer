import React, { useState, useRef } from 'react'
import Generators from './Generators'
import Navbar from '../Navbar'
import './Trainer.css'

import { useParams } from 'react-router-dom'

import { MathComponent as Math } from 'mathjax-react'
import './Question.css'
import './Qtimer'
import Qtimer from './Qtimer'

export default function Trainer() {

    const { trainerId } = useParams()
    const [trainer] = useState(() => {
        let id = parseInt(trainerId)
        if (!isNaN(id)) {
            return Generators[id]
        }
        else return window.location.pathname = "/trainer"
    })

    const preset = trainer.preset || []
    const [answer, setAnswer] = useState("")
    const [startedTime, setStartedTime] = useState(Date.now())
    const [prev, setPrev] = useState("")
    const [question, setQuestion] = useState(trainer.generate(preset))
    const [answers, setAnswers] = useState([])

    const prevRef = useRef(null)

    const validate = (val) => {
        let reg = new RegExp('^[-]?[0-9/. ]*$');
        return (reg.test(val))
    }

    const updateAnswer = (val) => {
        if (validate(val)) setAnswer(val)
    }

    const reset = () => {
        setAnswer("");
        setQuestion(trainer.generate(preset));
        setStartedTime(Date.now())
    }

    const checkAnswer = (e) => {
        e.preventDefault();
        if (answer.trim() === question.answer.toString()) {
            prevRef.current.style.color = "green"
            setPrev("Answered in: " + ((Date.now() - startedTime) / 1000).toFixed(2) + " seconds")
        }
        else {
            prevRef.current.style.color = "red"
            setPrev(answer + " CORRECT: " + question.answer)
        }
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
        reset()
    }

    // const [answers, setAnswers] = useState({})

    return (
        <div>
            <Navbar />
            <div className="question-container">
                {trainer.name} <a style={{ fontSize: "2vw" }} href={"/explanations/" + trainerId}>Learn</a>
                <hr />
                <form onSubmit={e => checkAnswer(e)} className="question-container">
                    <h3 ref={prevRef}>{prev}</h3>
                    <div className="math-container"><Math tex={question.question}></Math></div>
                    <input value={answer} onChange={e => updateAnswer(e.target.value)}
                        name="answer" autoComplete="off" className="question-input"></input>
                    <Qtimer startedTime={startedTime} />
                    {
                        answers === undefined || answers.filter(ans => ans.correct).length === 0 ? ""
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
                </form>
            </div>
        </div>
    )
}
