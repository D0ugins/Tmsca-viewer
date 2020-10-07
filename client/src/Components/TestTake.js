import React, { useState, useContext } from 'react';
import { Document, Page, pdfjs } from "react-pdf";
import Axios from "axios"

import NsInput from './Inputs/NsInput'
import MthSciInput from './Inputs/MthSciInput'

import UserContext from '../Context/UserContext'
import Timer from './Timer'
import './TestTake.css'
import { Link } from 'react-router-dom';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const typeMap = {
    'NS': 'Number Sense',
    'MA': 'Math',
    'SC': 'Science',
    'CA': 'Calculator'
}

const name = window.location.pathname.split("/").slice(-1)[0].split("_").join(" ")
const type = typeMap[name.slice(2, 4)]

const path = `${type}/${type} ${name.slice(-5)}/${name}`

const test = { name, path }


export default function TestTake() {
    const { user } = useContext(UserContext);

    const [pages, setPages] = useState([]);
    const [data, setData] = useState();

    const [ready, setReady] = useState(false);
    const onLoad = (pdf) => {
        // Set what pages to load once test is started
        if (type === "Number Sense") setPages([3, 4])
        else if (type === "Math") setPages([3, 4, 5, 6])
        else {
            // Sets pages for Science
            let scpages = []
            let total = pdf.numPages
            for (let i = 2; i <= total - 1; i++) { scpages.push(i) }
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

    const [answers, setAnswers] = useState({})
    const [times, setTimes] = useState({})
    const [startedAt, setStartedAt] = useState(0)
    const updateAnswers = (id, value) => {
        let newAnswer = {}
        newAnswer[id] = value
        setAnswers(prevAnswers => {
            return {
                ...prevAnswers,
                ...newAnswer
            }
        })

        let newTime = {}
        newTime[id] = Date.now() - startedAt
        setTimes(prevTimes => {
            return {
                ...prevTimes,
                ...newTime
            }
        })
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
            let start = el.innerText.indexOf(string)
            let end = start + string.length

            let range = new Range()
            range.setStart(el.firstChild, start)
            range.setEnd(el.firstChild, end)

            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            var sel = window.getSelection();
            range = sel.getRangeAt(0).cloneRange();
            selection.removeAllRanges();

            var rect = range.getBoundingClientRect();
            width = rect.width
            // Deals with that font being slightly to small for some reason
            if (el.style.fontFamily.includes("g_d0_f8")) width *= 1.05

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

        /* List of questions with exceptions/typos that have to be dealt with (choice, num, test : [type, flags])
           The fact that this list is so long makes me sad */
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
            var split = text.str.charAt(str.length - 1) === choices[choice] && texts[i + 1].str.charAt(0) === endchar

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
                    if (choice === last - 2) { choice = 0; question++; }
                    continue;
                }
                // Adds .'s to strings missing them
                else if (exception[0] === "missing" && (str.indexOf(choices[choice] + " ") === 0 || Object.keys(manual_fixed_strs).includes(str))) {
                    if (Object.keys(manual_fixed_strs).includes(str)) str = manual_fixed_strs[str]
                    else str = str.slice(0, 1) + '.' + str.slice(1)
                    text.left -= 3
                }

                // Deals with if there is a choice repeated (ie. A, B, B, C)
                else if (exception[0] === "repeat" && str.includes(choices[choice + exception[1]] + endchar)) {
                    let index = str.lastIndexOf(choices[choice + exception[1]] + endchar)
                    areas[question].choices[choice] = {
                        "top": text.top + offset,
                        // Takes into accout any text before the choice if there was any
                        "left": text.left + (getWidth(str.slice(0, index), text.span)),
                    };

                    if (choice === last + exception[1]) { choice = 0; question++; exception_state = 0; continue; }
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
                exception_state = 0;

                // Checks if 2 choices were in the same text
                split = text.str.charAt(str.length - 1) === choices[choice] && texts[i + 1].str.charAt(0) === endchar
                if (str.includes(choices[choice] + endchar) || split) i--

                if (choice === last) { choice = 0; question++; }

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
            setStartedAt(Date.now())
        }
    }

    const endTest = async (manual) => {
        try {
            const valid = await Axios.post(`/api/users/isTokenValid`, null,
                { headers: { "x-auth-token": user.token } }
            )
            let save = false

            if (valid) save = window.confirm(`${!manual ? "Time is up!\n" : ""} Would you like to save these results?`)

            const res = await Axios.post(`/api/grade`, {
                type,
                keypath: test.path,
                answers
            })
            const { score, gradeStates } = res.data
            setGradeStates(gradeStates)
            setScore(score)

            if (save) {
                await Axios.post(`/api/results`, {
                    type,
                    test_name: test.name,
                    score,
                    gradeStates,
                    times
                }, { headers: { "x-auth-token": user.token } }
                )
            }
        } catch (err) {
            console.error("Something went wrong with saving or grading your test results")
        }

        setDone(true)
    }


    return (
        <>
            {(!started || done || !ready) ?
                <button id="timer" className={"btn btn-primary" + (done ? " score-button" : "")} onClick={startTest} disabled={!(ready || started) || done}>
                    {done ? `Score: ${score}` : (!ready ? "Loading..." : "Start test")}
                </button>
                : <Timer type={type} endTest={endTest}></Timer>}

            <Document
                file={`${process.env.PUBLIC_URL}/tests/${test.path}.pdf`}
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
                            const { state, correct, answer } = gradeStates[area.id]
                            return <NsInput data={area} key={area.id}
                                gradeState={state} correct={correct} old={answer} />
                        })
                    )
                    :
                    (!done ?
                        areas.map(area => {
                            return <MthSciInput data={area} key={area.id} setAnswer={updateAnswers} type={type} />
                        })

                        : areas.map(area => {
                            const { state, correct, answer } = gradeStates[area.id]
                            return <MthSciInput data={area} key={area.id} type={type}
                                gradeState={state} correct={correct} old={answer} />
                        })
                    )
                }
            </div>

            <button onClick={endTest} id="grade-button" className="btn btn-success corner-button" hidden={(!started) || done}><p>Grade Test</p></button>
            <Link hidden={started && (!done)} id="exit-button" className="btn btn-danger corner-button" to="/"><p>Exit</p></Link>
        </>
    )
}