const router = require('express').Router();
const auth = require('../middleware/auth');
const { NsDetails, MthSciDetails, CaDetails } = require('../models/resultDetailsModel')
const { NsResult, MthSciResult, CaResult } = require('../models/resultModel')
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

const checkCalc = (ans, correct) => {
    if (!ans) return false
    let base = ans.base
    if (!base) return false
    let exp = ans.exponent ? ans.exponent : 0

    if (!exp && correct.exponent) {
        [base, exp] = base.toExponential(2).split("e+")
        base = parseFloat(base)
        exp = parseFloat(exp)
    }

    let correct_base = correct.base
    let correct_exp = correct.exponent ? correct.exponent : 0

    // Checks if exponent is correct and that base isnt more than .01 away from correct
    if (exp === correct_exp && Math.abs(base - correct_base) <= .011) return true;

    return false;
}

const gradeTest = (key, ans, type) => {
    let states = {};
    let penalize_skip = type === "Number Sense" || type === "Calculator";

    let answers = ans
    if (type === "Calculator") {
        for (answer in answers) {
            const { base, exponent } = answers[answer]
            if (exponent) {
                answers[answer] = { base: parseFloat(base.trim()), exponent: parseInt(exponent.trim()) }
            }
            else {
                answers[answer] = { base: parseFloat(base.trim()) }
            }

        }
    }
    let score = 0;
    // Gets all the questions that were actually answered
    let answered = Object.keys(answers).filter(q => answers[q]);

    let last = 0;
    // Sets score as if every question was wrong then adds back score for questions that were right
    if (penalize_skip) {
        // Gets last question that was answered
        if (answered.length) last = Math.max(...answered.map(x => parseInt(x)));
        score = last * key.penalty * -1;
    }
    else {
        score = answered.length * key.penalty * -1;
    }


    for (let i = 1; i <= (penalize_skip ? 80 : 50); i++) {
        let correct = key.answers[i];
        let state = "";
        if (i <= last || !penalize_skip) {
            if (answered.includes(i.toString())) {

                let is_correct = true;
                // If number sense test use checkNS function, Calculator uses checkCalc, otherwise just compare answer to correct
                if (type === "Number Sense") is_correct = checkNs(answers[i].trim(), correct, i)
                else if (type === "Calculator") is_correct = checkCalc(answers[i], correct)
                else is_correct = answers[i] === correct;

                if (is_correct) {
                    score += key.prize + key.penalty;
                    state = "correct";
                }
                else {
                    state = "wrong";
                }
            }
            else {
                if (penalize_skip) state = "skipped";
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

// Load correct schemas based on type
const loadSchemas = (type) => {
    let Result = {}
    let Details = {}
    switch (type) {
        case "Number Sense":
            Result = NsResult;
            Details = NsDetails;
            break;
        case "Calculator":
            Result = CaResult;
            Details = CaDetails;
            break;
        default:
            Result = MthSciResult;
            Details = MthSciDetails;
            break;
    }
    return { Result, Details }
}

// Grades test basedo on answer key path and answers sent in body
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

// Saves results to account
router.post("/", auth, async (req, res) => {
    try {
        const { type, test_name, score, gradeStates, times } = req.body
        let user = await User.findById(req.user)

        if (!type || !test_name || score == null || !gradeStates || !times) {
            return res.status(401).json({ msg: "Not all data has been provided" })
        }

        let { Result, Details } = loadSchemas(type)

        // Checks if test has been saved from less than a few seconds ago and if so cancels
        let results = await Result.find({ 'user._id': req.user })
        for (let result of results) {
            if (Date.now() - Date.parse(result.takenAt) < 30000) return res.status(401).json({ msg: "Test seems to have been saved twice" })
        }

        let data = {
            user: {
                _id: req.user,
                fullName: user.firstName + " " + user.lastName
            },
            type,
            test_name,
            score
        };
        let result = await new Result(data).save()

        let details = await new Details({ ...data, gradeStates, times, _id: result._id }).save()
        return res.json(details)

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message });
    }

})

// Gets results
router.get("/", cors(), async (req, res) => {
    try {
        let results = []
        const { user_id, test_name, type } = req.query

        /* Finds results based on search query from body
        Further filtering can be handled client side */
        if (test_name) {
            if (test_name.slice(2, 4) === "NS") results = await NsResult.find({ test_name })
            else results = await MthSciResult.find({ test_name })
        }

        // If admin account skip and return all results
        else if (user_id && user_id !== "5f84b37e35bf0600177f25ce") {
            let ns = NsResult.find({ 'user._id': user_id })
            let mthsci = MthSciResult.find({ 'user._id': user_id })
            let ca = CaResult.find({ 'user._id': user_id })
            results = [
                ...(await ns),
                ...(await mthsci),
                ...(await ca)
            ]
        }
        else if (type) {
            let { Result } = loadSchemas(type)
            results = await Result.find()
        }

        // If nothing specified return all results
        else {
            let ns = NsResult.find({})
            let mthsci = MthSciResult.find({})
            let ca = CaResult.find({})
            results = [
                ...(await ns),
                ...(await mthsci),
                ...(await ca)
            ]
        }
        return res.json(results)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: err.message });
    }

})

// Gets details (gradeStates and times) for specific test
router.get("/details", async (req, res) => {
    try {
        const { result_id, type } = req.query
        let { Details } = loadSchemas(type)

        return res.json(await Details.findById(result_id))

    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: err.message });
    }
})

// Returns an object of all answers that dont need an exponent box for calculator tests
router.get("/ints", (req, res) => {
    try {
        const { keypath } = req.query;

        // Load answer key from file
        const key = JSON.parse(fs.readFileSync(path.resolve('AnswerKeys', (keypath + " Key.json")), 'utf-8')).answers
        let ints = {}
        for (const i of Object.keys(key)) {
            ints[i] = key[i].exponent == undefined
        }

        return res.json(ints)
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message })
    }
})

module.exports = router;