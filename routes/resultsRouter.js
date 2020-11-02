const router = require('express').Router();
const auth = require('../middleware/auth');
const { NsResult, MthSciResult } = require('../models/resultModel')
const User = require('../models/userModel')
const fs = require('fs');
const path = require('path');

const cors = require('cors');

// Test grading stuff
const checkNs = (ans, correct, num) => {
    // Deals with esimation problems and ones with mutiple correct answers
    if (typeof correct === "object") {
        // Estimation problems
        if (num % 10 === 0) return (ans >= correct[0] && ans <= correct[1]);
        // Questions with multiple acceptable answers (ex. 1 1/2 or 3/2 or 1.5)
        else return correct.includes(ans);
    }

    else return ans === correct;
}

const gradeTest = (key, answers, type) => {
    var states = {};
    let is_ns = type === "Number Sense";

    let score = 0;
    // Gets all the questions that were actually answered
    let answered = Object.keys(answers).filter(q => answers[q]);

    // Sets score as if every question was wrong then adds back score for questions that were right
    if (is_ns) {
        var last = 0;
        // Gets last question that was answered
        if (answered.length) last = Math.max(...answered.map(x => parseInt(x)));
        score = last * key.penalty * -1;
    }
    else {
        score = answered.length * key.penalty * -1;
    }

    for (let i = 1; i <= (is_ns ? 80 : 50); i++) {
        let correct = key.answers[i];
        let state = "";
        if (i <= last || !is_ns) {
            if (answered.includes(i.toString())) {
                // If number sense test use checkNS function otherwise just compare answer to correct
                let is_correct = is_ns ? checkNs(answers[i].trim(), correct, i) : answers[i] === correct;

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
            "answer": answers[i] || "na",
            "correct": correct
        };
    }
    return {
        "score": score,
        "gradeStates": states
    };
}

router.post('/grade', cors(), (req, res) => {
    try {
        const { type, keypath, answers } = req.body

        // Load answer key from file
        const key = JSON.parse(fs.readFileSync(path.resolve('AnswerKeys', (keypath + " Key.json")), 'utf-8'))

        res.json(gradeTest(key, answers, type))
    } catch (err) {
        res.status(500).json({ "err": err.message })
        console.error(err)
    }

})

router.post("/", auth, async (req, res) => {
    try {
        const { type, test_name, score, gradeStates, times } = req.body
        let user = await User.findById(req.user)

        if (!type || !test_name || score == null || !gradeStates || !times) return res.status(401).json({ msg: "Not all data has been provided" })

        let data = {
            user: {
                _id: req.user,
                fullName: user.firstName + " " + user.lastName
            },
            type,
            test_name,
            score,
            gradeStates,
            times
        };

        let Result = type === "Number Sense" ? NsResult : MthSciResult
        // Checks if test has been saved from less than a few seconds ago and if so cancels
        let results = await Result.find({ 'user._id': req.user })
        for (result of results) {
            if (Date.now() - Date.parse(result.takenAt) < 30000) return res.status(401).json({ msg: "Test seems to have been saved twice" })
        }

        res.json(await new Result(data).save())


    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})

router.get("/", cors(), async (req, res) => {
    try {

        let results = []
        const { user_id, test_name, type } = req.query

        /* Finds tests based on search query from body
        Further filtering can be handled client side */
        if (test_name) {
            if (test_name.slice(2, 4) === "NS") results = await NsResult.find({ test_name })
            else results = await MthSciResult.find({ test_name })
        }

        // If admin account skip and return all results
        else if (user_id && user_id !== "5f84b37e35bf0600177f25ce") {
            let ns = await NsResult.find({ 'user._id': user_id })
            let mthsci = await MthSciResult.find({ 'user._id': user_id })
            results = ns.concat(mthsci)
        }


        else if (type) {
            if (type === "Number Sense") results = await NsResult.find()
            else results = await MthSciResult.find()
        }

        // If nothing specified return all results
        else results = (await NsResult.find()).concat(await MthSciResult.find())

        return res.json(results)
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

})

module.exports = router;