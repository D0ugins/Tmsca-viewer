const router = require('express').Router();
const auth = require('../middleware/auth');
const { NsResult, MthSciResult } = require('../models/resultModel')
const User = require('../models/userModel')

const cors = require('cors');

router.post("/", auth, async (req, res) => {
    try {
        const { type, test_name, score, gradeStates, times } = req.body
        let user = await User.findById(req.user)

        if (!type || !test_name || !score || !gradeStates || !times) return res.status(401).json({ msg: "Not all data has been provided" })

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

        if (type === "Number Sense") {
            res.json(await new NsResult(data).save())
        }
        else {
            res.json(await new MthSciResult(data).save())
        }
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
        else if (user_id) {
            let ns = await NsResult.find({ 'user._id': user_id })
            let mthsci = await MthSciResult.find({ 'user._id': user_id })
            results = ns.concat(mthsci)
        }
        else if (type) {
            if (type === "Number Sense") results = await NsResult.find()
            else results = await MthSciResult.find()
        }
        else results = (await NsResult.find()).concat(await MthSciResult.find())

        res.json(results)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})

module.exports = router;