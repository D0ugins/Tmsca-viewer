import React, { useState,  useEffect } from 'react'

export default function Timer ({ type, endTest }) {
    
    const [time, setTime] = useState(2);
    const decreaseTime = () => {setTime(time - 1)}

    useEffect(() => {
        var mins = type === "Number Sense" ? 10 : 40
        setTime(mins * 60)
    }, [type])

    useEffect(() => {
        if (time <= 0) {endTest(false); return}

        var id = setTimeout(decreaseTime, 1000);
        return () => clearTimeout(id);
        // eslint-disable-next-line
    }, [time])

    return (
        <button id="timer" className="btn btn-primary"> {new Date(time * 1000).toISOString().substr(14, 5)} </button>
    )
}