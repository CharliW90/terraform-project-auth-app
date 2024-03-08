const express = require('express')
const cors = require("cors");
require("dotenv").config({
  path: "./.env.local",
});

const { authLogin, authRegister, authPassword } = require("./controller.js")

const app = express()
app.use(express.json());
app.use(cors());

app.get('/api/auth', (req, res) =>{
    res.sendStatus(200)
})

app.post('/api/auth/login', authLogin);

app.post('/api/auth/register', authRegister)

app.patch('/api/auth/password', authPassword)

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    }
});

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
