import React, { useState, useEffect } from 'react'

// Simple timer component that shows the time elapsed since a started time give in props
export default function Qtimer({ startedTime }) {

    const [time, setTime] = useState(0)

    useEffect(() => {
        setTimeout(() => setTime(Date.now() - startedTime), 100)
    }, [time, startedTime])

    return (<div className="question-timer">{(time / 1000).toFixed(1)}</div>)
}
