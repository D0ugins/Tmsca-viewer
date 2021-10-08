const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

// Express setup
const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

// Mongoose setup
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, (err) => {
    if (err) throw err;
    console.log("Mongodb connection successful")
})


app.use("/api/users", require("./routes/userRouter"));
app.use("/api/results", require("./routes/resultsRouter"));
app.use("/api/trainer", require("./routes/trainerRouter"))


// Load react stuff if not hitting api route
staticFolder = process.env.NODE_ENV === "development" ? "public" : "build"

app.use(express.static('client/' + staticFolder))

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', staticFolder, 'index.html'))
})


app.listen(port, () => {
    console.log(`Listening on port ` + port)
})