const BestTime = require('../models/bestTimeModel')
const User = require('../models/userModel')
const auth = require('../middleware/auth')
const router = require("express").Router();

router.post("/bestTimes", auth, async (req, res) => {
    try {
        const { trickId, time } = req.body;
        if (!time || !trickId) return res.status(401).json({ msg: "No trick and/or time provided" })

        let user = await User.findById(req.user);
        if (!user) return res.status(401).json({ msg: "User does not exist" })

        let old = await BestTime.findOne({ 'user._id': req.user, trickId })

        if (!old) {
            return res.json(await new BestTime({
                user: {
                    _id: req.user,
                    fullName: user.firstName + " " + user.lastName
                },
                trickId,
                time
            }).save())
        } else {
            old.time = time
            return (await old.save())
        }
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
})

router.get("/bestTimes", auth, async (req, res) => {
    try {

        const { trickId } = req.query

        if (trickId) {
            let time = await BestTime.findOne({ 'user._id': req.user, trickId })
            return res.json({ time: time.time })
        } else {
            let times = await BestTime.find({ 'user._id': req.user })

            let obj = {}
            times.map(time => {
                obj[time.trickId] = time.time
            })

            return res.json(obj)
        }


    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
})

module.exports = router