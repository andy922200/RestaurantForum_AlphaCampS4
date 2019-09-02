const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
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
      req.flash('error_messages', "你沒有存取此使用者的權限")
      return res.redirect(`/users/${req.user.id}`)
    } else {
      return User.findAndCountAll({
        where: { id: req.params.id },
        include: [{ model: Comment, include: [Restaurant] }]
      }).then(result => {
        let user = result.rows[0]["dataValues"]
        let commentCounts = user.Comments.length
        return res.render('profile', { user: user, commentCounts: commentCounts })
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
          req.flash('success_messages', '已成功修改資料`')
          res.redirect(`/users/${user.id}`)
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
              req.flash('success_messages', '已成功修改資料`')
              res.redirect(`/users/${user.id}`)
            })
          })
      })
    }
  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        favorite.destroy()
          .then(restaurant => {
            return res.redirect('back')
          })
      })
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return res.redirect('back')
    })
  },
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(like => {
      like.destroy().then(restaurant => {
        return res.redirect('back')
      })
    })
  },
  getTopUser: (req, res) => {
    return User.findAll({
      include: [{
        model: User, as: 'Followers'
      }]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  }
}

module.exports = userController