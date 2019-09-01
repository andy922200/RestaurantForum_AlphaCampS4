const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

// initialize express-validator
const { check, validationResult } = require('express-validator')
const { registerFormCheck } = require('../public/javascripts/validationRule')

let userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    const errors = validationResult(req)
    let errorMessages = []
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          if (user) {
            req.flash('error_messages', '信箱重複')
            return res.redirect('/signup')
          } else if (!errors.isEmpty()) {
            for (let i = 0; i < errors.array().length; i++) {
              errorMessages.push({ message: errors.array()[i]['msg'] })
            }
            res.render('signup', { errorMessages: errorMessages })
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
            }).then(user => {
              return res.redirect('/signin')
            })
          }
        })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    if (Number(req.params.id) !== req.user.id) {
      req.flash('error_messages', "你沒有瀏覽此使用者的權限")
      return res.redirect(`/users/${req.user.id}`)
    } else {
      User.findByPk(req.params.id).then(user => {
        res.render('profile', { user: user })
      })
    }
  },

  editUser: (req, res) => {
    if (Number(req.params.id) !== req.user.id) {
      req.flash('error_messages', "你沒有編輯此使用者的權限")
      return res.redirect(`/users/${req.user.id}`)
    } else {
      return User.findByPk(req.params.id).then(user => {
        res.render('editProfile', { user: user })
      })
    }
  },

  putUser: (req, res) => {
    const { file } = req
    const { name, email } = req.body
    if (Number(req.params.id) !== req.user.id) {
      req.flash('error_messages', "你沒有儲存此使用者的權限")
      return res.redirect(`/users/${req.user.id}`)
    }

    if (!name || !email) {
      req.flash('error_messages', '請檢查名稱和Email是否輸入')
      return res.redirect('back')
    }
    // save without an image / with an image
    if (!file) {
      return User.findByPk(req.params.id).then(user => {
        user.update({
          name: req.body.name,
          email: req.body.email,
          image: user.image
        }).then(user => {
          res.render('profile', { user: user, success_messages: `已成功修改資料` })
        })
      })
    } else {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              email: req.body.email,
              image: file ? img.data.link : user.image
            }).then(user => {
              return res.render('profile', { user: user, success_messages: `已成功修改資料` })
            })
          })
      })
    }
  }
}

module.exports = userController