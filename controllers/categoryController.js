const db = require('../models')
const Category = db.Category

let categoryController = {
  getCategories: (req, res) => {
    return Category.findAll().then(categories => {
      return res.render('admin/categories', { categories: categories })
    })
  },
  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '請輸入種類名稱')
      return res.redirect('back')
    } else {
      return Category.create({
        name: req.body.name
      }).then((category => {
        res.redirect('/admin/categories')
      }))
    }
  }
}

module.exports = categoryController