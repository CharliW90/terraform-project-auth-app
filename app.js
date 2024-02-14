const express = require('express')
const { credentials: { username, password } } = require("./credentials")

const app = express()
app.use(express.json());

app.post('/api/auth', (req, res) => {
    const { body } = req
    if (username === body.username && password === body.password) {
        res.status(200).send({ msg: 'Authorisation successful' })
    } else {
        res.status(400).send({ msg: 'Authorisation unsuccessful - credentials incorrect'})
    }

})

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    }
});

app.use((err, req, res, next) => {
    res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
