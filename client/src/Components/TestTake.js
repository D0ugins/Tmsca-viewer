import React, { useState, useContext } from 'react';
import { Document, Page, pdfjs } from "react-pdf";
import Axios from "axios"

import NsInput from './Inputs/NsInput'
import MthSciInput from './Inputs/MthSciInput'
import CaInput from './Inputs/CaInput'

import UserContext from '../Context/UserContext'
import Timer from './Timer'
import './TestTake.css'
import { Link, useParams } from 'react-router-dom';
import { getTestPath, typeMap } from '../utils/testNames'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const practice = window.location.search.split("=")[1] === "practice"

export default function TestTake() {
    const { user } = useContext(UserContext);
    const { testName } = useParams()

    const name = testName.replace(/_/g, " ")
    const type = typeMap[name.slice(2, 4)]

    const path = getTestPath(name)
    const test = { name, path }

    const [pages, setPages] = useState([]);
    const [data, setData] = useState();
    const [ints, setInts] = useState({});

    const [ready, setReady] = useState(false);
    const onLoad = (pdf) => {
        // Set what pages to load once test is started
        if (type === "Number Sense") setPages([3, 4])
        else if (type === "Math") setPages([3, 4, 5, 6])
        else if (type === "Calculator") setPages([2, 3, 4, 5, 6, 7, 8])
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
        setAnswers(prevAnswers => { return { ...prevAnswers, [id]: value } })
        setTimes(prevTimes => {
            return {
                ...prevTimes,
                [id]: (value != null ? Date.now() - startedAt : null)
            }
        })
    };
    const [gradeStates, setGradeStates] = useState({})
    const [score, setScore] = useState(null);

    const getWidth = (string, el = "") => {
        const fontSize = (window.innerWidth / 54.34).toFixed(1);
        const fontWeight = type === "Science" ? 500 : 900
        let width = 0;
        if (string.length === 0) return 0;

        else if (el === "") {
            // For getting width of string not in text
            let canvas = document.createElement("canvas");
            let context = canvas.getContext("2d");
            context.font = `normal normal ${fontWeight} ${fontSize}px times`
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

            let sel = window.getSelection();
            range = sel.getRangeAt(0).cloneRange();
            selection.removeAllRanges();

            let rect = range.getBoundingClientRect();
            width = rect.width
            // Deals with that font being squished for some reason
            if (el.style.fontFamily.includes("g_d0") && type === "Science") { width *= 1.234 }
        }

        return width;
    }

    const loadInts = async () => {
        let res = await Axios.get("/api/results/ints", { params: { keypath: path } });
        setInts(res.data)
    }

    const findNs = (texts) => {
        let question = 0;
        let areas = [];

        const pageheight = (window.innerWidth / 600.7) * 792;
        let page = 0;
        let offset = pageheight * page;

        let mode = "new"
        for (let i = 0; i < texts.length; i++) {
            // Fixes certain sections of questions appearing out of order
            if (type === "Calculator" && ['17-18', '18-19', '19-20'].includes(name.slice(-5))) {
                // Filter out undefined terms
                const len = areas.filter(area => area).length
                if (question === 72 && len < 72) question = 60;
                else if (question === 60 && len < 62) question = 62;
                // MSCA4 19-20 only has out of order on one page
                else if (question === 62 && len > 70) question = name === "MSCA4 19-20" ? 72 : 74;
                else if (question === 80 && name !== "MSCA4 19-20") question = 72;
            }

            const text = texts[i];
            let index = text.str.indexOf("_");
            let lastindex = text.str.lastIndexOf("_");

            // List of weidly formated questions (num, test)
            const exceptions = [
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
                    let reg = /^[ ]$/
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
                if (i !== 0) {
                    let last = texts[i - 1];

                    let old_page = last.span.parentElement.parentElement.dataset.pageNumber
                    let new_page = text.span.parentElement.parentElement.dataset.pageNumber
                    if (old_page < new_page) page++
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

                    // Checks if 2 blanks in same span
                    if (text.str.includes(`${question + 2}=`) && text.str.split("=")[1].includes("_")) {
                        // Set str to text before the second question
                        let str = text.str.split(`${question + 2}=`)[0]

                        areas[question] = {
                            "id": question + 1,
                            "top": text.top + offset,
                            // Takes into account text before and after the actual _'s)
                            "left": text.left + getWidth(str.slice(0, index), text.span),
                            "width": getWidth(str.slice(index, str.lastIndexOf("_") + 1), text.span)
                        };


                        // Replaces all the starting underscores with spaces (2 spaces have same width)

                        // Removes non underscore stuff from the start
                        if (text.str.startsWith(`${question + 1}=`)) text.str = text.str.slice(3)
                        else if (text.str.startsWith("=")) text.str = text.str.slice(1)

                        let j = 0
                        while (text.str[j] === "_") {
                            text.str = text.str.slice(0, j) + "  " + text.str.slice(j + 1)
                            j += 2
                        }
                        text.span.innerText = text.str
                        mode = "new";
                        i--
                        question++;
                    }
                }
            }

            else {
                // Checks if there was an _
                if (text.str.startsWith("_")) {
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
                    i--
                    question++;
                }
            }
        }
        // Remove extra boxes at top on elementary tests
        if (test.name.includes("EL") && type === "Number Sense") {
            // Remove things at top
            areas = areas.filter(area => (area.top / pageheight) > .25)
            // Recalcuate ids and shift up because font is different
            const shift = pageheight / 300
            areas = areas.map((area, i) => {
                return {
                    ...area,
                    id: i + 1,
                    top: area.top - shift
                }
            })
        }

        return areas
    }

    const findMthSci = (texts) => {
        const pageheight = (window.innerWidth / 600.7) * 792;

        const last = type === "Science" ? 4 : 5
        let areas = [];
        let choice = 0;
        const choices = ["A", "B", "C", "D", "E"]

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
            "0, 19, MSSC KO 20-21": ["intext"],
            "2, 49, MSSC KO 20-21": ["intext"],
            "2, 27, MSSC2 20-21": ["intext"],
            "3, 1, MSSC3 20-21": ["intext"],
            "0, 12, MSSC3 20-21": ["image"],
            "0, 30, MSSC3 20-21": ["intext"],
            "1, 30, MSSC3 20-21": ["missing"],
            "2, 40, MSSC6 20-21": ["missing"],
            "0, 7, MSSC7 20-21": ["image"],
            "3, 5, ELSC SPRING OL 20-21": ["repeat", 1],
            "2, 39, MSSC11 20-21": ["repeat", -1],
            "3, 39, MSSC11 20-21": ["repeat", -1],

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
            "3, 25, MSMA11 17-18": ["missing"],
            "4, 41, MSMA4 20-21": ["repeat", -1],
            "0, 36, MSMA13 20-21": ["missing"],
            "2, 26, MSMA TU 20-21": ["missing"]
        }
        const manual_fixed_strs = {
            "A.  uracil           B  phosphate           C.  ": "A.  uracil           B.  phosphate           C.  "
        }

        // Tracks if current exception has been handled
        let exception_state = 0
        let page = type === "Science" ? 1 : 0
        let offset = page * pageheight
        for (let i = 0, question = 0; i < texts.length - 1; i++) {
            offset = page * pageheight;
            let text = texts[i]
            let str = text.str

            // In the 17-18 Science tests it uses the form A) instead of A.
            let endchar = test.name.includes("17-18") && type === "Science" ? ')' : "."

            // Checks If Choice got split over mutiple texts
            let split = text.str.charAt(str.length - 1) === choices[choice] && texts[i + 1].str.charAt(0) === endchar

            // Check if question is exception
            if (Object.keys(exceptions).includes(`${choice}, ${question + 1}, ${test.name}`)) {
                const exception = exceptions[`${choice}, ${question + 1}, ${test.name}`]
                // Deals with A. or something appears within the question
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

                    if (choice - exception[1] === last) { choice = 0; question++; exception_state = 0; continue; }
                    choice++;
                    // Deals with multiple choices in same string
                    if (str.includes(choices[choice + exception[1]] + '.') || split) i--

                    exception_state++;
                    continue;
                }
                // Deals with when the answer choices are imbeded in an image for some reason
                else if (exception[0] === "image" && str.includes(question + 1)) {

                    // Checks for new page
                    let last = areas[question - 1];
                    if (last.choices[0].top > (text.top + offset)) { page++; console.log(1); }
                    offset = pageheight * page

                    areas[question] = {
                        "id": question + 1,
                        "choices": []
                    }

                    const lefts = [20, 40, 60, 80]
                    for (const left in lefts) {
                        areas[question].choices[left] = {
                            "top": (text.top + (pageheight / 12)) + offset,
                            "left": window.innerWidth * (lefts[left] / 100)
                        }
                    }
                    question++;
                    continue;
                }

            }

            if (str.includes(choices[choice] + endchar) || split) {

                let index = str.indexOf(choices[choice] + endchar)
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
                if (str.includes(choices[choice] + endchar) || split || Object.keys(manual_fixed_strs).includes(str)) i--

                if (choice === last) { choice = 0; question++; }

            }

        }
        return areas
    }

    const findInputs = async () => {

        if (type === "Calculator") loadInts()

        // Loads a page to wait enough time for document to load its pages
        await (await data.getPage(pages[1])).getTextContent();

        // Returns all spans in document
        let texts = []
        const spans = document.querySelectorAll("span")
        const weight = type === "Science" ? 500 : 900
        for (let i = 0; i < spans.length; i++) {
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
            case "Calculator":
                setAreas(findNs(texts));
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
            // Only set ready to false if not in practice mode
            setReady(practice)
            // Check if there is a logged in user
            const valid = await Axios.post(`/api/users/isTokenValid`, null,
                { headers: { "x-auth-token": user.token } }
            )
            let save = false

            // Ask if user wants to save results
            if (valid.data && !practice) save = window.confirm((!manual ? "Time is up!\n" : "") + "Would you like to save these results?")

            // Send results to backed for grading
            const res = await Axios.post(`/api/results/grade`, {
                type,
                keypath: test.path,
                answers
            })
            const { score, gradeStates } = res.data
            setGradeStates(gradeStates)
            setScore(score)
            setReady(true)
            // Only set done to true if not in practice mode
            setDone(!practice)

            if (save) {
                // Save results to database
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

    }
    return (
        <>
            {(!started || done || !ready) ?
                <button id="timer" className={"btn btn-primary" + (done ? " score-button" : "")} onClick={startTest} disabled={!(ready || started) || done}>
                    {done ? `Score: ${score}` : (!ready ? "Loading..." : "Start test")}
                </button>
                : <Timer type={type} endTest={endTest} practice={practice} score={score} />}

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
            {started ?
                <div id="inputs">
                    {areas.map(area => {
                        if (done) {
                            const { state, correct, answer } = gradeStates[area.id]
                            switch (type) {
                                case "Number Sense":
                                    return <NsInput data={area} key={area.id}
                                        gradeState={state} correct={correct} value={answer} />
                                case "Calculator":
                                    return <CaInput data={area} key={area.id} int={ints[area.id]}
                                        gradeState={state} correct={correct} value={answer} />
                                default:
                                    return <MthSciInput data={area} key={area.id} type={type}
                                        gradeState={state} correct={correct} old={answer} />
                            }
                        }
                        else if (practice) {
                            let state = ""
                            let correct = ""

                            // If graded set proper state and correct
                            if (gradeStates[area.id]) {
                                state = gradeStates[area.id].state;
                                correct = gradeStates[area.id].correct
                            }
                            switch (type) {
                                case "Number Sense":
                                    return <NsInput data={area} key={area.id} setAnswer={updateAnswers}
                                        gradeState={state} correct={correct} value={answers[area.id]} practice={practice} />
                                case "Calculator":
                                    return <CaInput data={area} key={area.id} int={ints[area.id]} setAnswer={updateAnswers}
                                        gradeState={state} correct={correct} value={answers[area.id]} practice={practice} />
                                default:
                                    return <MthSciInput data={area} key={area.id} type={type} setAnswer={updateAnswers} selected={answers[area.id]}
                                        gradeState={state} correct={correct} old={answers[area.id]} practice={practice} />
                            }
                        }
                        else {
                            switch (type) {
                                case "Number Sense":
                                    return <NsInput data={area} value={answers[area.id]} setAnswer={updateAnswers} key={area.id} practice={practice} />
                                case "Calculator":
                                    return <CaInput data={area} setAnswer={updateAnswers} value={answers[area.id]} key={area.id} int={ints[area.id]} practice={practice} />
                                default:
                                    return <MthSciInput data={area} key={area.id} setAnswer={updateAnswers} type={type} selected={answers[area.id]} practice={practice} />
                            }
                        }

                    })}
                </div>
                : ""}

            <button onClick={endTest} id="grade-button" className="btn btn-success corner-button" hidden={(!started) || done}><p>Grade {practice ? "Questions" : "Test"}</p></button>
            <Link hidden={started && (!done)} id="exit-button" className="btn btn-danger corner-button" to="/"><p>Exit</p></Link>
        </>
    )
}