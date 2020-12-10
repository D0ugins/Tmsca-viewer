const mongoose = require("mongoose");

const genGradeStates = (type) => {
    let gradeStates = {}

    if (type === "Calculator") {
        for (i = 1; i <= 80; i++) {
            gradeStates[i.toString()] = {
                "state": { type: String, required: true, default: "na" },
                "answer": {
                    type: {
                        base: { type: Number, required: true },
                        exponent: { type: Number }
                    }, defualt: "na"
                },
                "correct": {
                    type: {
                        base: { type: Number, required: true },
                        exponent: { type: Number }
                    }, defualt: "na"
                },
            }
        }
    }
    else {
        for (i = 1; i <= (type === "Number Sense" ? 80 : 50); i++) {
            gradeStates[i.toString()] = {
                "state": { type: String, required: true, default: "na" },
                "answer": { type: String, required: true, default: "na" },
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


const NsDetailsSchema = new mongoose.Schema({
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        fullName: { type: String, required: true }
    },
    test_name: { type: String, required: true },
    type: { type: String, required: true, default: "Number Sense" },
    score: { type: Number, min: -320, max: 400 },
    gradeStates: genGradeStates("Number Sense"),
    times: genTimes(true),
    takenAt: { type: Date, default: Date.now }
})

const MthSciDetailsSchema = new mongoose.Schema({
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        fullName: { type: String, required: true }
    },
    test_name: { type: String, required: true },
    type: { type: String, required: true },
    score: { type: Number, min: -100, max: 250 },
    gradeStates: genGradeStates("MthSci"),
    times: genTimes(false),
    takenAt: { type: Date, default: Date.now }
})


const CaDetailsSchema = new mongoose.Schema({
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        fullName: { type: String, required: true }
    },
    test_name: { type: String, required: true },
    type: { type: String, required: true, default: "Calculator" },
    score: { type: Number, min: -320, max: 400 },
    gradeStates: genGradeStates("Calculator"),
    times: genTimes(true),
    takenAt: { type: Date, default: Date.now }
})

module.exports = {
    NsDetails: mongoose.model("nsDetails", NsDetailsSchema),
    MthSciDetails: mongoose.model("mthSciDetails", MthSciDetailsSchema),
    CaDetails: mongoose.model("caDetails", CaDetailsSchema)
}