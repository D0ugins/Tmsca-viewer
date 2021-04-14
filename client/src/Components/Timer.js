import React, { useState, useEffect } from 'react'
import './Timer.css'

const formatTime = time => {
    let str = new Date(time).toISOString();
    return time > (3600 * 1000) ? str.substr(11, 8) : str.substr(14, 5)
}

export default function Timer({ type, endTest, practice = false, score }) {

    const [startTime, setStartTime] = useState(Date.now())
    // Sets time in seconds based on test type
    const [totalTime] = useState(() => {
        if (practice) return 0
        const minute = 60 * 1000

        if (type === "Number Sense") return 10 * minute
        else if (type === "Calculator") return 30 * minute
        else return 40 * minute
    })
    const [time, setTime] = useState(totalTime)
    const updateTime = () => {
        // Calculates time elapsed since start
        const elapsed = Date.now() - startTime
        setTime(practice ? elapsed : totalTime - elapsed)
    }

    // Sets the time the timer started at on load
    useEffect(() => {
        setStartTime(Date.now())
    }, [])

    useEffect(() => {
        if (time <= 0 && !practice) { endTest(false); return }

        let id = setTimeout(updateTime, 1000);
        return () => clearTimeout(id);
        // eslint-disable-next-line
    }, [time])

    return (
        <button id="timer" className="btn btn-primary"> <b>{formatTime(time)}</b>{(practice && score) && " Current score: " + score} </button>
    )
}
