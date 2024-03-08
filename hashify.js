var md5 = require('js-md5');

exports.passwordHash = (hash_key, user_password) => {
  return md5(`${hash_key}:${user_password}`)
}

exports.passwordCheck = (user_id, password_hash, password_to_check) => {
  return password_hash === md5(`${user_id}:${password_to_check}`)
}