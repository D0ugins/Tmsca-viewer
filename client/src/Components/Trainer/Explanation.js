import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import math from 'remark-math'
import gfm from 'remark-gfm'
import Markdown from 'react-markdown'
import { MathComponent as Math } from 'mathjax-react'
import { Table } from 'react-bootstrap'

import Generators from './Generators'
import Navbar from '../Navbar'
import './Explanation.css'

export default function Explanation() {
    const { trickId } = useParams()
    const [explanation, setExplanation] = useState("")
    const trick = Generators[trickId]

    useEffect(() => {
        if (!trick) return

        const explanationFile = trick.explanationFile
        if (!explanationFile) return setExplanation("# No explanation for this trick has been created")

        let path = process.env.PUBLIC_URL + "/explanations/NsTricks/" + explanationFile
        // Loads trick markdown file
        fetch(path)
            .then(res => res.text())
            .then(data => setExplanation(data))

    }, [trick])

    const findTrick = (explanationFile) => {
        return Generators.find(gen => {
            return gen.explanationFile === explanationFile
        }).id
    }

    // Renderers for math/tables
    const renderers = {
        inlineMath: ({ value }) => <Math tex={value} display={false} />,
        math: ({ value }) => <Math tex={value} />,
        table: ({ children }) => <Table bordered striped style={{ width: "75%", margin: "2% auto" }} > {children}</Table>,
        link: ({ href, children }) => {
            if (href.startsWith("http")) {
                return <a href={href}>{children}</a>
            }
            return <a href={"./" + findTrick(href)}>{children}</a>
        }
    }

    return (
        <div>
            <Navbar />
            <div style={{ textAlign: "center", fontSize: "3vw" }}>
                {trick?.name} <a style={{ fontSize: "1.5vw" }} href={"/trainer/" + trickId}>Practice</a>
            </div>
            <hr />
            <Markdown plugins={[math, gfm]} className="explanation-container" renderers={renderers} children={explanation} ></Markdown>
        </div>
    )
}
