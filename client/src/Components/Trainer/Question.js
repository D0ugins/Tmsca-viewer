import React, { useState, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { MathComponent as Math } from 'mathjax-react'
import './Question.css'

export default function Question({ generator, preset = [] }) {

    const [answer, setAnswer] = useState("")
    const [question, setQuestion] = useState(generator.generate(preset))

    const input = useRef(null)

    const validate = (val) => {
        let reg = new RegExp('^[-]?[0-9/. ]*$');
        return (reg.test(val))
    }

    const updateAnswer = (val) => {
        if (validate(val)) setAnswer(val)
    }

    const checkAnswer = (e) => {
        e.preventDefault();
        if (answer.trim() === question.answer.toString()) {
            input.current.className += " ns-correct"
        }
        else {
            input.current.className += " ns-wrong"
            setAnswer(prev => prev + " CORRECT: " + question.answer)
        }
        input.current.disabled = true
    }

    const reset = () => {
        setAnswer("");
        setQuestion(generator.generate(preset));
        input.current.className = "question-input";
        input.current.disabled = false;
        input.current.focus()
    }

    return (
        <form onSubmit={e => checkAnswer(e)} className="question-container">
            <div className="math-container"><Math tex={question.question}></Math></div>
            <input value={answer} ref={input} onChange={e => updateAnswer(e.target.value)}
                name="answer" autoComplete="off" className="question-input"></input>
            <Button onClick={reset}>Next</Button>
        </form>
    )
}
