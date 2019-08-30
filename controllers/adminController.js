const db = require('../models')
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = '95f7b7fe0b0ea22'
const Restaurant = db.Restaurant
const User = db.User

const adminControllers = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll().then(restaurants => {
      return res.render('admin/restaurants', { restaurants: restaurants })
    })
  },

  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },

  postRestaurant: (req, res) => {
    const { file } = req
    const { name, tel, address, opening_hours } = req.body
    if (!name || !tel || !address || !opening_hours) {
      req.flash('error_messages', '請檢查名稱、電話、地址、營業時間欄位是否有空白')
      return res.redirect('back')
    }
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? `/upload/${file.originalname}` : null,
        }).then((restaurant) => {
          req.flash('success_messages', '餐廳已成功建立')
          return res.redirect('/admin/restaurants')
        })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null
      }).then(restaurant => {
        req.flash('success_messages', '餐廳已成功建立')
        res.redirect('/admin/restaurants')
      })
    }
    /* 本機端模式
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log(err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Restaurant.create({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: file ? `/upload/${file.originalname}` : null,
          }).then((restaurant) => {
            req.flash('success_messages', '餐廳已成功建立')
            return res.redirect('/admin/restaurants')
          })
        })
      })
    }*/
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      return res.render('admin/restaurant', { restaurant: restaurant })
    })
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      return res.render('admin/create', { restaurant: restaurant })
    })
  },

  putRestaurant: (req, res) => {
    const { file } = req
    const { name, tel, address, opening_hours } = req.body
    if (!name || !tel || !address || !opening_hours) {
      req.flash('error_messages', '請檢查名稱、電話、地址、營業時間欄位是否有空白')
      return res.redirect('back')
    }

    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
            })
              .then((restaurant) => {
                req.flash('success_messages', 'restaurant was successfully to update')
                res.redirect('/admin/restaurants')
              })
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        restaurant.update({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: restaurant.image
        }).then(restaurant => {
          req.flash('success_messages', '餐廳資料已經成功更新')
          res.redirect('/admin/restaurants')
        })
      })
    }
    /*　本機端模式
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log(err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Restaurant.findByPk(req.params.id)
            .then((restaurant) => {
              restaurant.update({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                image: file ? `/upload/${file.originalname}` : restaurant.image
              }).then((restaurant) => {
                req.flash('success_messages', '餐廳資料已經成功更新')
                res.redirect('/admin/restaurants')
              })
            })
        })
      })
    }*/
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      restaurant.destroy()
        .then(restaurant => {
          req.flash('error_messages', `${restaurant.name} 餐廳已被刪除`)
          res.redirect('/admin/restaurants')
        })
    })
  },

  editUsers: (req, res) => {
    return User.findAll().then(users => {
      res.render('admin/users', { users: users })
    })
  },

  putUsers: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      const { isAdmin } = user
      if (isAdmin) {
        user.update({ isAdmin: 0 })
          .then(user => {
            req.flash('success_messages', `${user.email} 已更改為一般用戶`)
            return res.redirect('/admin/users')
          })
      } else {
        user.update({ isAdmin: 1 })
          .then(user => {
            req.flash('success_messages', `${user.email} 已更改為管理員`)
            return res.redirect('/admin/users')
          })
      }
    })
  }
}

module.exports = adminControllers

