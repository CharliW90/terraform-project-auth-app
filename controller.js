const { addUser, login, passwordChange } = require("./model")

exports.authLogin = (req, res, next) => {
  const { body } = req
  if (body.username && body.password) {
    login(body.username, body.password)
    .then((login) => {
      res.status(login.status).send({ msg: login.msg })
    })
    .catch(next)
  } else {
    res.status(400).send({ msg: 'Login unsuccessful - credentials missing' })
  }
}

exports.authRegister = (req, res, next) => {
  const { body } = req
  if (body.username && body.password) {
    addUser(body.username, body.password)
    .then((registeredUser) => {
      res.status(201).send({ msg: `Registration for ${registeredUser.username} successful!`})
    })
    .catch(next)
  } else {
    res.status(400).send({ msg: 'Registration unsuccessful - credentials missing' })
  }
}

exports.authPassword = (req, res, next) => {
  const { body } = req
  if (body.username && body.password && body.newPassword) {
    passwordChange(body.username, body.password, body.newPassword)
    .then((update) => {
      res.status(update.status).send({ msg: update.msg})
    })
    .catch(next)
  } else {
    res.status(400).send({ msg: 'Registration unsuccessful - credentials missing' })
  }
}