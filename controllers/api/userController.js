const bcrypt = require('bcrypt-nodejs')
const db = require('../../models')
const User = db.User

// JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

let userController = {
  signIn: (req, res) => {
    // 檢查必要欄位
    if (!req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: '請檢查Email和密碼是否填寫' })
    }
    // 檢查 user 資料
    let username = req.body.email
    let password = req.body.password

    User.findOne({ where: { email: username } })
      .then(user => {
        if (!user) return res.status(401).json({ status: 'error', message: '無此使用者資料' })
        if (!bcrypt.compareSync(password, user.password)) {
          return res.status(401).json({ status: 'error', message: '密碼輸入錯誤' })
        }
        // 簽發 token
        let payload = { id: user.id }
        let token = jwt.sign(payload, process.env.JWT_SECRET)
        return res.json({
          status: 'success',
          message: '成功登入',
          token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
          }
        })
      })
  }
}

module.exports = userController