import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from "react-pdf";
import TestInput from './TestInput'
import Timer from './Timer'

import './TestTake.css'
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function TestTake ({ test }) {
    const [type] = useState(test.type)
    const [pages, setPages] = useState([]);
    const [data, setData] = useState();

    const [ready, setReady] = useState(false);
    const udpateReady = (pdf) => {setReady(true); setData(pdf)}
    const [started, setStarted] = useState(false);
    const [done, setDone] = useState(false)
    
    const [areas, setAreas] = useState([]);
    
    const [key, setKey] = useState({});
    const [answers, setAnswers] = useState({})
    const updateAnswers = (id, value) => {
        var new_data = answers
        new_data[id] = value;
        setAnswers(new_data)
    };
    const [gradeStates, setGradeStates] = useState({})
    const [score, setScore] = useState(null);

    const loadTexts = async (test) => {
        
        // Loads text content from pdf to wait for page to do the same so it can load spans
        var data = []
        for (const page in pages) {
            data[page] = test.getPage(pages[page])
        }

        data = await Promise.all(data)
        for (const page in data) {
            data[page] = await data[page].getTextContent()
        }

       data = [];
        // Returns all spans in document
        var spans = document.querySelectorAll("span")
        for (var i = 0; i < spans.length; i++) {
            let span = spans[i]
            data[i] = {
                "str": span.innerText,
                "top": parseFloat(span.style.top.slice(0, -2)),
                "left": parseFloat(span.style.left.slice(0, -2))
            }
        }
        return data
    }
    
    const getWidth = (string) => {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        var fontsize = document.querySelector(".pdf-page span").style.fontSize
        context.font = `normal normal 900 ${fontsize} times new roman`
        return context.measureText(string).width;
    }

    const findInputs = async () => {
        var texts = await loadTexts(data);
        var question = 1;
        var areas = [];

        if (test.type === "Number Sense"){
            var mode = "new"
            const pageheight = (window.innerWidth / 601) * 792
            var page = 0;    
            var offset = pageheight * page;

            for (var i = 0; i < texts.length ; i++) {
                const text = texts[i];
                var index = text.str.indexOf("_");
                var lastindex = text.str.lastIndexOf("_");

                // List of weidly formated questions (num, test)
                var exeptions = [
                    "68, MSNS1 19-20",
                    "67, MSNS6 18-19",
                    "63, MSNS7 18-19",
                    "59, MSNS8 18-19",
                    "67, MSNS8 18-19"
                ]
                
                // Deals with wierdly formatted questions
                if (exeptions.includes(`${question}, ${test.name}`)) {
                    if (mode === "new") {
                        if (text.str.includes("=")) {
                            areas[question - 1] = {
                                "id": question,
                                "type": type,
                                "top": text.top + offset,
                                // Takes into account text before and after the actual _'s)
                                "left": text.left + getWidth("  "),
                                "width": getWidth(" ")
                            };
                            mode = "expand";
                        }
                    }
                    else {
                        let reg = new RegExp('^[ ]$')
                        if (reg.test(text.str)) {
                            areas[question - 1].width += (getWidth("_") * .65);
                        }
                        else {
                            mode = "new";
                            question++;
                        }
                    }
                    continue;
                }

                // If looking for start of new question or looking for rest of current
                if (mode === "new") {
                    
                    // Checks if new page
                    if (question !== 1 && index > -1){
                        let last = areas[question - 2]
                        if (last.top > (text.top + offset) && last.left > text.left) {page++}
                        offset = page * pageheight
                    }

                    // If there was an _
                    if (index > -1){
                        areas[question - 1] = {
                            "id": question,
                            "type": type,
                            "top": text.top + offset,
                            // Takes into account text before and after the actual _'s)
                            "left": text.left + getWidth(text.str.slice(0, index)),
                            "width": getWidth(text.str.slice(index, lastindex + 1))
                        };
                        mode = "expand";
                    }
                }

                else {
                    // Checks if there was an _
                    if (lastindex > -1) {
                        // Checks if the blank was only one span 
                        if (text.str.includes(`(${question + 1})`)) {
                            mode = "new";
                            i--
                            question++;
                        }
                        else areas[question - 1].width += getWidth(text.str.slice(index, lastindex + 1))
                    }
                    // If no _ move to next question
                    else {
                        mode = "new";
                        question++;
                    }
                }
            }
        }
        setAreas(areas)
        setReady(true)
    }

    const startTest = async () => {
        if (!started) {
            setReady(false)
            setStarted(true);
            await findInputs()
            setReady(true)
        }
    }

    const checkNs = (ans, correct, num) => {
        // Deals with esimation problems and ones with mutiple correct answers
        if (typeof correct === "object") {
            if (num % 10 === 0) return (ans >= correct[0] && ans <= correct[1])
            else return correct.includes(ans)
        }

        else return ans === correct
    } 

    const gradeTest = () => {
        var states = {}
        
        if (type === "Number Sense") {
            var answered = Object.keys(answers);
            var last = Math.max(...answered.map(x => parseInt(x)))
            console.log(last)
            var score = last * key.penalty * -1;

            for (var i = 1; i <= 80; i++) {
                if (i <= last) {
                    if (answered.includes(i.toString())) {
                        var correct = key.answers[i]
                        if (checkNs(answers[i], correct, i)) {
                            score += key.prize + key.penalty;
                            states[i] = "correct"
                        }
                        else {
                            states[i] = "wrong"
                        }
                    }
                    else {
                        states[i] = "skipped"
                    }
                }
                else {
                    states[i] = "na"
                }
                
            }
        } 

        setGradeStates(states)
        setScore(score)
    }

    const endTest = (manual) => {
        if (!manual) {alert("Time is up!")}
        gradeTest();
    }

    // Load stuff
    useEffect(() => {
        // Load answer key
        async function loadJson() {
            let key = await fetch(test.jpath);
            key = await key.json();
            setKey(key);
        }
        loadJson();

        // Set what pages to load once test is started
        if (test.type === "Number Sense") setPages([3,4])
        else if (test.type === "Math") setPages([3,4,5,6])
        else (setPages([3,4,5,6,7,8,9]))
        
        // That one test dosent have title pages for some reason
        if (test.tpath.includes('MSNS STATE 18-19')) setPages([1,2])
    // eslint-disable-next-line
    }, [test])
 
    useEffect(() => {
        if (score !== null) {
            setDone(true)
        }
    }, [score])

    return (
        <>
            {(!started || done || !ready) ? <button id="timer" className="btn btn-primary" onClick={startTest} disabled={!(ready || started || done)}>
                {done ? `Score: ${score}` : (!ready ? "Loading..." : "Start test")}
            </button> 
            : <Timer type={type} endTest={endTest}></Timer>}

            <Document
            file={test.tpath}
            onLoadSuccess={udpateReady}
            onLoadError={console.error}
            className="pdf">
                {started ? 
                pages.map(page => <Page className="pdf-page" pageNumber={page} scale={window.innerWidth / 600} key={page}/>)
                : <Page className="pdf-page" pageNumber={1} scale={window.innerWidth / 600} />}
            </Document>
            
            <div id="inputs">
                { !done ? areas.map(area => {
                    return <TestInput data={area} setAnswer={updateAnswers} key={area.id}/>
                }) : areas.map(area => {
                    return <TestInput data={area} setAnswer={updateAnswers} key={area.id} 
                    gradeState={gradeStates[area.id]} correct={key.answers[area.id]} disabled="true" old={answers[area.id]}/>})}
            </div>

            <button onClick={endTest} id="grade-button" className="btn btn-success" hidden={(!started) || done}><p>Grade Test</p></button>
        </>
    )
}