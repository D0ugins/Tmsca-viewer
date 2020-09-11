import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from "react-pdf";

import NsInput from './NsInput'
import MthSciInput from './MthSciInput'

import Timer from './Timer'
import './TestTake.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function TestTake({ test }) {
    const [type] = useState(test.type)
    const [pages, setPages] = useState([]);
    const [data, setData] = useState();

    const [ready, setReady] = useState(false);
    const onLoad = (pdf) => {
        // Set what pages to load once test is started
        if (test.type === "Number Sense") setPages([3, 4])
        else if (test.type === "Math") setPages([3, 4, 5, 6])
        else {
            let scpages = []
            let total = pdf.numPages
            for (let i = 3; i <= total - 1; i++) {scpages.push(i)}
            setPages(scpages)
        }

        // That one test dosent have title pages for some reason
        if (test.name === 'MSNS STATE 18-19') setPages([1, 2])
        setReady(true); 
        setData(pdf);
    }
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

    const getWidth = (string, el = "") => {
        
        const fontsize = (window.innerWidth / 54.34).toFixed(1);
        const fontweight = type === "Science" ? 500 : 900
        var width = 0;
        if (string.length === 0) return 0;

        else if (el === "") {
            // For getting width of string not in text
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            context.font = `normal normal ${fontweight} ${fontsize}px times new roman`
            width = context.measureText(string).width;
        }
        else {
            // Spaces are calculated as the wrong size in the other method so for science you need this
            var index = string.length
            let range = new Range()
            range.setStart(el.firstChild, 0)
            range.setEnd(el.firstChild, index)

            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            var sel = window.getSelection();
            range = sel.getRangeAt(0).cloneRange();
            selection.removeAllRanges();

            var rect = range.getBoundingClientRect();
            width = rect.right - rect.left;
            // Deals with that font being slightly to small for some reason
            if (el.style.fontFamily.includes("g_d0_f8")) width *= 1.01

        }

        return width;
    }

    const findNs = (texts) => {
        var question = 0;
        var areas = [];

        const pageheight = (window.innerWidth / 600.575) * 792;
        var page = 0;
        var offset = pageheight * page;

        var mode = "new"
        for (var i = 0; i < texts.length; i++) {
            const text = texts[i];
            var index = text.str.indexOf("_");
            var lastindex = text.str.lastIndexOf("_");

            // List of weidly formated questions (num, test)
            var exceptions = [
                "68, MSNS1 19-20",
                "67, MSNS6 18-19",
                "63, MSNS7 18-19",
                "59, MSNS8 18-19",
                "67, MSNS8 18-19"
            ];

            // Deals with wierdly formatted questions
            if (exceptions.includes(`${question + 1}, ${test.name}`)) {
                if (mode === "new") {
                    if (text.str.includes("=")) {
                        areas[question] = {
                            "id": question + 1,
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
                        areas[question].width += (getWidth("_") * .65);
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
                if (question !== 0 && index > -1) {
                    let last = areas[question - 1];
                    if (last.top > (text.top + offset) && last.left > text.left) { page++ }
                    offset = page * pageheight;
                }

                // If there was an _
                if (index > -1) {
                    areas[question] = {
                        "id": question + 1,
                        "top": text.top + offset,
                        // Takes into account text before and after the actual _'s)
                        "left": text.left + getWidth(text.str.slice(0, index), text.span),
                        "width": getWidth(text.str.slice(index, lastindex + 1), text.span)
                    };
                    mode = "expand";
                }
            }

            else {
                // Checks if there was an _
                if (lastindex > -1) {
                    // Checks if the blank was only one span 
                    if (text.str.includes(`(${question + 2})`)) {
                        mode = "new";
                        i--
                        question++;
                    }
                    else areas[question].width += getWidth(text.str.slice(index, lastindex + 1), text.span)
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
        const pageheight = (window.innerWidth / 600.7) * 792;
        
        var last = type === "Science" ? 4 : 5
        var areas = [];
        var choice = 0;
        var choices = ["A", "B", "C", "D", "E"]

        // List of questions with exceptions/typos that have to be dealt with (choice, num, test : [type, flags])
        // The fact that this list is so long makes me sad
        const exceptions = {
            "0, 4, MSSC1 19-20": ["intext"],
            "0, 27, MSSC1 19-20": ["missing"],
            "1, 48, MSSC2 19-20": ["order"],
            "2, 48, MSSC2 19-20": ["order"],
            "2, 48, MSSC3 19-20": ["intext"],
            "1, 37, MSSC5 19-20": ["order"],
            "2, 37, MSSC5 19-20": ["order"],
            "3, 32, MSSC13 19-20": ["intext"],
            "2, 1, MSSC10 18-19": ["repeat", -1],
            "3, 1, MSSC10 18-19": ["repeat", -1],
            "1, 6, MSSC12 18-19": ["missing"],
            "3, 37, MSSC13 18-19": ["repeat", -1],

            "2, 6, MSMA2 19-20": ["repeat", 1],
            "2, 32, MSMA2 19-20": ["repeat", -1],
            "3, 23, MSMA4 19-20": ["repeat", -1],
            "1, 4, MSMA KO 19-20": ["missing"],
            "2, 15, MSMA5 18-19": ["missing"],
            "1, 8, MSMA11 18-19": ["missing"],
            "4, 13, MSMA2 17-18": ["missing"],
            "4, 47, MSMA2 17-18": ["missing"],
            "4, 40, MSMA6 17-18": ["repeat", -1],
            "0, 31, MSMA7 17-18": ["missing"],
            "1, 48, MSMA7 17-18": ["repeat", 1],
            "1, 49, MSMA7 17-18": ["repeat", 1],
            "1, 50, MSMA7 17-18": ["repeat", 1],
            "3, 5, MSMA11 17-18": ["missing"],
            "3, 25, MSMA11 17-18": ["missing"]
            
        }

        // Tracks if current exception has been handled
        var exception_state = 0
        for (let i = 0, question = 0, offset = 0, page = 0; i < texts.length - 1; i++) {
            let text = texts[i]
            var str = text.str
            
            // In the 17-18 Science tests it uses the form A) instead of A.
            let endchar = test.name.includes("17-18") && type === "Science" ? ')' : "."

            // Checks If Choice got split over mutiple texts
            var split = text.str.charAt(str.length - 1) === choices[choice] && texts[i+1].str.charAt(0) === endchar

            // Check if question is exception
            if (Object.keys(exceptions).includes(`${choice}, ${question + 1}, ${test.name}`)) {
                const manual_fixed_strs = {
                }

                var exception = exceptions[`${choice}, ${question + 1}, ${test.name}`]

                if (exception[0] === "intext") {
                    // Skips over falsley detected text
                    if (exception_state === 0 && (str.includes(choices[choice] + '.') || split)) {
                        exception_state++;
                        continue;
                    }
                }
                
                // Deals with if answer Choices are detected out of order (ie. A, C, B, D)
                else if (exception[0] === "order" && str.includes(choices[choice + 1] + endchar) && exception_state === 0) {
                    let index = str.indexOf(choices[choice + 1] + endchar)
                    areas[question].choices[choice + 1] = {
                        "top": text.top + offset,
                        // Takes into accout any text before the choice if there was any
                        "left": text.left + (getWidth(str.slice(0, index), text.span)),
                    };
                    exception_state++
                    if (choice === last - 2) {choice = 0; question++;}
                    continue;
                }
                // Adds .'s to strings missing them
                else if (exception[0] === "missing" && (str.indexOf(choices[choice] + " ") === 0 || Object.keys(manual_fixed_strs).includes(str))) {
                    if (Object.keys(manual_fixed_strs).includes(str)) str = manual_fixed_strs[str]
                    else str = str.slice(0, 1) + '.' + str.slice(1)
                    text.left -= 3
                }

                // Deals with if there is a choice repeated (ie. A, B, B, C)
                else if (exception[0] === "repeat" && str.includes(choices[choice + exception[1]] + endchar)){
                    let index = str.lastIndexOf(choices[choice + exception[1]] + endchar)
                    areas[question].choices[choice] = {
                        "top": text.top + offset,
                        // Takes into accout any text before the choice if there was any
                        "left": text.left + (getWidth(str.slice(0, index), text.span)),
                    };

                    if (choice === last + exception[1]) {choice = 0; question++; exception_state = 0; continue;}
                    choice++;
                    // Deals with multiple choices in same string
                    if (str.includes(choices[choice + exception[1]] + '.') || split) i--
                    
                    exception_state++;
                    continue;
                }

            }

            if (str.includes(choices[choice] + endchar) || split) {

                var index = str.indexOf(choices[choice] + endchar)
                // Slightly different stuff for first choice
                if (choice === 0) {
                    // Checks for new page
                    if (question !== 0) {
                        let last = areas[question - 1];
                        if (last.choices[0].top > (text.top + offset)) { page++ }
                        offset = page * pageheight;
                    }

                    areas[question] = {
                        "id": question + 1,
                        "choices": []
                    }
                };
                areas[question].choices[choice] = {
                    "top": text.top + offset,
                    // Takes into accout any text before the choice if there was any
                    "left": text.left + (getWidth(str.slice(0, index), text.span)),
                };
                choice++;
                exception_state=0;
                
                // Checks if 2 choices were in the same text
                split = text.str.charAt(str.length - 1) === choices[choice] && texts[i+1].str.charAt(0) === endchar
                if (str.includes(choices[choice] + endchar) || split) i--

                if (choice === last) {choice = 0; question++;}

            }
            
        }
        return areas
    }

    const findInputs = async () => {
        // Loads a page to wait enough time for document to load its pages
        var texts = await data.getPage(pages[0]);
        texts = await texts.getTextContent();

        texts = [];
        // Returns all spans in document
        var spans = document.querySelectorAll("span")
        var weight = type === "Science" ? 500 : 900
        for (var i = 0; i < spans.length; i++) {
            let span = spans[i];
            texts[i] = {
                "str": span.innerText,
                "top": parseFloat(span.style.top.slice(0, -2)),
                "left": parseFloat(span.style.left.slice(0, -2)),
                "span": span
            };
            // Sets font-weight based off of test type
            span.style.fontWeight = weight;
        }

        switch (type) {
            case 'Number Sense':
                setAreas(findNs(texts));
                break;
            case 'Math':
                setAreas(findMthSci(texts));
                break;
            case "Science":
                setAreas(findMthSci(texts));
                break;
            default:
                console.error("Unsupported test type");
                break;
        }
        setReady(true)
    }

    const startTest = async () => {
        if (!started) {
            setReady(false);
            setStarted(true);
            await findInputs();
            setReady(true);
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
        var states = {};
        var is_ns = type === "Number Sense";

        var score = 0;
        var answered = Object.keys(answers);
        if (is_ns) {
            var last = 0;
            if (answered.length) last = Math.max(...answered.map(x => parseInt(x)));
            score = last * key.penalty * -1;
        }
        else {
            score = answered.length * key.penalty * -1;
        }

        for (var i = 1; i <= 80; i++) {

            if (i <= last || !is_ns) {
                if (answered.includes(i.toString())) {
                    var correct = key.answers[i];

                    var is_correct = is_ns ? checkNs(answers[i], correct, i) : answers[i] === correct

                    if (is_correct) {
                        score += key.prize + key.penalty;
                        states[i] = "correct";
                    }
                    else {
                        states[i] = "wrong";
                    }
                }
                else {
                    if (is_ns) states[i] = "skipped";
                    else states[i] = "na";
                }
            }
            else {
                states[i] = "na";
            }

        }

        setGradeStates(states);
        setScore(score);
    }

    const endTest = (manual) => {
        if (!manual) { alert("Time is up!") }
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
        // eslint-disable-next-line
    }, [test])

    useEffect(() => {
        if (score !== null) {
            setDone(true)
        }
    }, [score])


    return (
        <>
            {(!started || done || !ready) ? 
            <button id="timer" className={"btn btn-primary" + (done ? " score-button" : "")} onClick={startTest} disabled={!(ready || started) || done}>
                {done ? `Score: ${score}` : (!ready ? "Loading..." : "Start test")}
            </button>
                : <Timer type={type} endTest={endTest}></Timer>}

            <Document
                file={test.tpath}
                loading=""
                onLoadSuccess={onLoad}
                onLoadError={console.error}
                className="pdf">
                {!started ? <Page className="pdf-page" pageNumber={1} scale={window.innerWidth / 600} loading="" /> : ""}
                {/* Loads pages at start but only shows them once test starts */}
                {pages.map(page => <Page className="pdf-page" pageNumber={page} scale={window.innerWidth / 600} loading="" key={page} 
                renderMode={started ? "canvas" : "none"} />)}
            </Document>

            <div id="inputs">
                {type === "Number Sense"
                    ?
                    (!done ?
                        areas.map(area => {
                            return <NsInput data={area} setAnswer={updateAnswers} key={area.id} />
                        })

                        : areas.map(area => {
                            return <NsInput data={area} key={area.id}
                                gradeState={gradeStates[area.id]} correct={key.answers[area.id]} disabled="true" old={answers[area.id]} />
                        })
                    )
                    :
                    (!done ?
                        areas.map(area => {
                            return <MthSciInput data={area} key={area.id} setAnswer={updateAnswers} type={type}/>
                        })

                        : areas.map(area => {
                            return <MthSciInput data={area} key={area.id} type={type}
                                gradeState={gradeStates[area.id]} correct={key.answers[area.id]} old={answers[area.id]} />
                        })
                    )
                }
            </div>
            <button onClick={endTest} id="grade-button" className="btn btn-success" hidden={(!started) || done}><p>Grade Test</p></button>
        </>
    )
}