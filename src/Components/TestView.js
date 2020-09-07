import React from 'react'
import './TestView.css'


export default function ({ test }) {

    return (
        <>
            <iframe src={test.tpath} title="test" className="test-view"></iframe>
        </>
    )
}
