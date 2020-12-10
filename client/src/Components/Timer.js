import React, { useState, useEffect } from 'react'
import './Timer.css'

export default function Timer({ type, endTest }) {

    const [startTime, setStartTime] = useState(Date.now())
    // Sets time inseconds based on test type
    const [totalTime] = useState(() => {
        if (type === "Number Sense") return 10 * 60
        else if (type === "Calculator") return 30 * 60
        else return 40 * 60
    })
    const [time, setTime] = useState(totalTime)
    const decreaseTime = () => {
        // Calculates time elapsed since start
        setTime(totalTime - Math.floor((Date.now() - startTime) / 1000))
    }

    useEffect(() => {
        setStartTime(Date.now())
    }, [])

    useEffect(() => {
        if (time <= 0) { endTest(false); return }

        let id = setTimeout(decreaseTime, 1000);
        return () => clearTimeout(id);
        // eslint-disable-next-line
    }, [time])

    return (
        <button id="timer" className="btn btn-primary"> {new Date(time * 1000).toISOString().substr(14, 5)} </button>
    )
}