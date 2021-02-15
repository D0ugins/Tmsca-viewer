const mongoose = require("mongoose");

const genGradeStates = (type) => {
    let gradeStates = {}

    const state = { type: String, required: true, default: "na" }
    if (type === "Calculator") {
        const answer = {
            type: {
                base: { type: Number, required: true },
                exponent: { type: Number }
            }, defualt: "na"
        }

        for (i = 1; i <= 80; i++) {
            gradeStates[i.toString()] = {
                "state": state,
                "answer": answer,
                "correct": answer,
            }
        }
    }
    else {
        const answer = { type: String, required: true, default: "na" }
        for (i = 1; i <= (type === "Number Sense" ? 80 : 50); i++) {
            gradeStates[i.toString()] = {
                "state": state,
                "answer": answer,
                "correct": type === "Number Sense" ? { type: mongoose.Schema.Types.Mixed, required: true } :
                    { type: String, required: true }
            }
        }
    }

    return gradeStates
}

const genTimes = (is_long) => {
    let times = {}
    for (i = 1; i <= (is_long ? 80 : 50); i++) {
        times[i.toString()] = { type: Number, default: null }
    }
    return times
}

const base = {
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        fullName: { type: String, required: true }
    },
    test_name: { type: String, required: true },
    takenAt: { type: Date, default: Date.now },
    type: { type: String, required: true },
    score: { type: Number, min: -320, max: 400 }
}

const NsDetailsSchema = new mongoose.Schema({
    ...base,
    gradeStates: genGradeStates("Number Sense"),
    times: genTimes(true)
})

const MthSciDetailsSchema = new mongoose.Schema({
    ...base,
    gradeStates: genGradeStates("MthSci"),
    times: genTimes(false)
})


const CaDetailsSchema = new mongoose.Schema({
    ...base,
    gradeStates: genGradeStates("Calculator"),
    times: genTimes(true)
})

module.exports = {
    NsDetails: mongoose.model("nsDetails", NsDetailsSchema),
    MthSciDetails: mongoose.model("mthSciDetails", MthSciDetailsSchema),
    CaDetails: mongoose.model("caDetails", CaDetailsSchema)
}