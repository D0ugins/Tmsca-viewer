const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json())
app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}))

const KEYFOLDER = 'AnswerKeys'

function checkNs(ans, correct, num) {
    // Deals with esimation problems and ones with mutiple correct answers
    if (typeof correct === "object") {
        // Estimation problems
        if (num % 10 === 0) return (ans >= correct[0] && ans <= correct[1])
        // Questions with multiple acceptable answers (ex. 1 1/2 or 3/2 or 1.5)
        else return correct.includes(ans)
    }

    else return ans === correct
}

function gradeTest(key, answers, type) {
    var states = {};
    let is_ns = type === "Number Sense";

    let score = 0;
    let answered = Object.keys(answers);
    // Sets score as if each question was wrong then adds back score for questions that were right
    if (is_ns) {
        var last = 0;
        // Gets last question that was answered
        if (answered.length) last = Math.max(...answered.map(x => parseInt(x)));
        score = last * key.penalty * -1;
    }
    else {
        score = answered.length * key.penalty * -1;
    }

    for (let i = 1; i <= 80; i++) {
        let correct = key.answers[i];
        let state = ""
        if (i <= last || !is_ns) {
            if (answered.includes(i.toString())) {
                
                // If number sense test use checkNS function otherwise just compare answer to correct
                let is_correct = is_ns ? checkNs(answers[i], correct, i) : answers[i] === correct

                if (is_correct) {
                    score += key.prize + key.penalty;
                    state = "correct";
                }
                else {
                    state = "wrong";
                }
            }
            else {
                if (is_ns) state = "skipped";
                else state = "na";
            }
        }
        else {
            state = "na";
        }
        states[i] = {
            "state": state,
            "answer": answers[i] || "",
            "correct": correct
        }
    }
    return {
        "score": score,
        "gradeStates": states
    }
}

app.post('/grade', (req, res) => {
    try {
        const { type, keypath, answers } = req.body

        // Load answer key from file
        const key = JSON.parse(fs.readFileSync(path.join(KEYFOLDER, keypath + " Key.json"), 'utf-8'))

        res.status(200)
            .json(gradeTest(key, answers, type))
    } catch(err) {
        res.status(500).json({"err": err.message})
        console.error(err)
    }
    
})

app.listen(port, () => {
    console.log(`Listening on port ` + port)
})