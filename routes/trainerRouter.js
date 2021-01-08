const BestTime = require('../models/bestTimeModel')
const User = require('../models/userModel')
const Leaderboard = require('../models/leaderboardSchema')
const auth = require('../middleware/auth')
const router = require("express").Router();


async function updateLeaderBoard({ trick, time, user }) {

    let board = await Leaderboard.findOne({ trick })

    if (!board) {
        board = await new Leaderboard({ trick, times: [] }).save()
    }
    let old = board.times.find((time => {
        return time.user._id.toString() === user._id.toString()
    }))

    if (!old) {
        board.times.push({ user, time })
    }
    else {
        let index = board.times.indexOf(old)
        board.times[index] = { user, time }
    }
    board.times = board.times.sort(((a, b) => a.time - b.time))
    await board.save()
}

router.post("/bestTimes", auth, async (req, res) => {
    try {
        const { trick, time } = req.body;
        if (!time || !trick) return res.status(401).json({ msg: "No trick and/or time provided" })

        let user = await User.findById(req.user);
        if (!user) return res.status(401).json({ msg: "User does not exist" })

        let old = await BestTime.findOne({ 'user._id': req.user, trick })
        if (!old) {
            // If no best time yet craete a new one and save it

            const result = await new BestTime({
                user: {
                    _id: req.user,
                    fullName: user.firstName + " " + user.lastName
                },
                trick,
                time
            }).save()

            res.json(result).send()
            updateLeaderBoard(result)
            return

        }
        else {
            // If there was an old time check to make sure it is faster then update it

            if (old.time >= parseFloat(time)) old.time = time
            else return (res.json(null))

            const result = await old.save()
            res.json(result).send()

            updateLeaderBoard(result)
            return
        }
    } catch (err) {
        console.error(err)
        return res.status(500).json({ err: err.message })
    }
})

router.get("/bestTimes", auth, async (req, res) => {
    try {

        const trick = req.query.trick
        const user = req.user

        if (trick != null) {
            // If requestion specific trick return that
            let time = await BestTime.findOne({ 'user._id': user, trick })

            if (time) {
                let board = await Leaderboard.findOne({ trick })
                let rank = board.times.findIndex(time => {
                    return time.user._id.toString() === user.toString()
                })

                return res.json({ time: time.time, rank })
            }
            else return res.json({ time: null })
        }
        else {
            // If no trick specified return all tricks that have times
            let times = await BestTime.find({ 'user._id': user })

            let data = {}
            for (let i in times) {
                const { time, trick } = times[i]
                let rank = null

                const board = await Leaderboard.findOne({ trick })
                if (board) {
                    rank = board.times.findIndex(time => time.user._id.toString() === user.toString()) + 1
                }

                data[trick] = { time, rank, }
            }

            return res.json(data)
        }

    } catch (err) {
        console.error(err)
        return res.status(500).json({ err: err.message })
    }
})


module.exports = router