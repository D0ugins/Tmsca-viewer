import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from "react-pdf";

import NsInput from './NsInput'
import MthSciInput from './MthSciInput'

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
    
    const getWidth = (string) => {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        var fontsize = (window.innerWidth / 54.34).toFixed(1)
        context.font = `normal normal 900 ${fontsize}px times new roman`
        return context.measureText(string).width;
    }

    const findNs = (texts) => {
        var question = 1;
        var areas = [];
        
        const pageheight = (window.innerWidth / 600.6) * 792
        var page = 0;    
        var offset = pageheight * page;
        
        var mode = "new"
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
        return areas
    }

    const findMthSci = (texts) => {
        
        const pageheight = (window.innerWidth / 600.6) * 792

        const choices = ["A", "B", "C", "D", "E"]
            
        const widths = {
            "A": getWidth("A."),
            "B": getWidth("B."),
            "C": getWidth("C."),
            "D": getWidth("D."),
            "E": getWidth("E.")
        }

        let windowW = window.innerWidth
        const lefts = {
            "A": windowW * .06,
            "B": windowW * .24,
            "C": windowW * .42,
            "D": windowW * .60,
            "E": windowW * .78,
        }

        var areas = [];
        for (let i = 0, question = 1, offset = 0, page=0; i < texts.length ; i++) {
            const text = texts[i]

            if (text.str.includes('A.')) {
                // Checks if new page
                if (question !== 1){
                    let last = areas[question - 2]
                    if (last.choices[0].top > (text.top + offset)) {page++}
                    offset = page * pageheight
                }

                areas[question - 1] = {
                    "id": question,
                }

                areas[question - 1].choices = choices.map(choice => {
                    return {
                        "top": text.top + offset,
                        "left": lefts[choice],
                        "width": widths[choice]
                    }
                })
                question++;
            }
        }
        return areas
    }

    const findInputs = async () => {
        // Loads text content from pdf to wait for page to do the same so it can load spans
        var texts = []
        for (const page in pages) {
            texts[page] = data.getPage(pages[page])
        }

        texts = await Promise.all(texts)
        for (const page in texts) {
            texts[page] = await texts[page].getTextContent()
        }

        texts = [];
        // Returns all spans in document
        var spans = document.querySelectorAll("span")
        for (var i = 0; i < spans.length; i++) {
            let span = spans[i]
            texts[i] = {
                "str": span.innerText,
                "top": parseFloat(span.style.top.slice(0, -2)),
                "left": parseFloat(span.style.left.slice(0, -2))
            }
        }

        if (type === "Number Sense") {
            setAreas(findNs(texts))
        }

        else {
            setAreas(findMthSci(texts))
        }
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
        var is_ns = type === "Number Sense"
        
        var score = 0
        var answered = Object.keys(answers);
        if (is_ns) {
            var last = 0;
            if (answered.length) last = Math.max(...answered.map(x => parseInt(x)))
            score = last * key.penalty * -1
        }
        else {
            score = answered.length * key.penalty * -1
        }

        for (var i = 1; i <= 80; i++) {

            if (i <= last || !is_ns) {
                if (answered.includes(i.toString())) {
                    var correct = key.answers[i]

                    var is_correct = is_ns ? checkNs(answers[i], correct, i) : answers[i] === correct

                    if (is_correct) {
                        score += key.prize + key.penalty;
                        states[i] = "correct"
                    }
                    else {
                        states[i] = "wrong"
                    }
                }
                else {
                    if (is_ns) states[i] = "skipped"
                    else states[i] = "na"
                }
            }
            else {
                states[i] = "na"
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
            console.log(1)
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
            loading=""
            onLoadSuccess={udpateReady}
            onLoadError={console.error}
            className="pdf">
                {started ? 
                pages.map(page => <Page className="pdf-page" pageNumber={page} scale={window.innerWidth / 600} key={page}/>)
                : <Page className="pdf-page" pageNumber={1} scale={window.innerWidth / 600} />}
            </Document>

            <div id="inputs">
                { type === "Number Sense" 
                    ? 
                    (!done ? 
                        areas.map(area => {
                            return <NsInput data={area} setAnswer={updateAnswers} key={area.id}/>
                        }) 
                        
                        : areas.map(area => {
                            return <NsInput data={area} key={area.id} 
                            gradeState={gradeStates[area.id]} correct={key.answers[area.id]} disabled="true" old={answers[area.id]}/>
                        })
                    ) 
                    : 
                    (!done ?
                        areas.map(area => {
                            return <MthSciInput data={area} key={area.id} setAnswer={updateAnswers}/>
                        })

                        : areas.map(area => {
                            return <MthSciInput data={area} key={area.id} 
                            gradeState={gradeStates[area.id]} correct={key.answers[area.id]} old={answers[area.id]}/>
                        })
                    )
                }
            </div>

            <button onClick={endTest} id="grade-button" className="btn btn-success" hidden={(!started) || done}><p>Grade Test</p></button>
        </>
    )
}