const { addUser, alreadyRegistered, login } = require("./model")

exports.authLogin = (req, res, next) => {
  const { body } = req
  if (body.username && body.password) {
    alreadyRegistered(body.username).then((registered) => {
      if(!registered){
        res.status(400).send({ msg: 'Login unsuccessful - username does not exist' })
      } else {
        login(body.username, body.password)
        .then((login) => {
          if(login){
            res.status(201).send({ msg: `Login for ${body.username} successful!`})
          } else {
            res.status(400).send({ msg: 'Login unsuccessful - password does not match.' })
          }
        })
        .catch(next)
      }
    })
  } else {
    res.status(400).send({ msg: 'Login unsuccessful - credentials missing' })
  }
}

exports.authRegister = (req, res, next) => {
  const { body } = req
  if (body.username && body.password) {
    alreadyRegistered(body.username).then((registered) => {
      if(registered){
        res.status(400).send({ msg: 'Registration unsuccessful - username already exists' })
      } else {
        addUser({username: body.username, password: body.password})
        .then((registeredUser) => {
          res.status(201).send({ msg: `Registration for ${registeredUser.username} successful!`})
        })
        .catch(next)
      }
    })
  } else {
    res.status(400).send({ msg: 'Registration unsuccessful - credentials missing' })
  }

}