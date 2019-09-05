const db = require('../models')
const Category = db.Category
const categoryService = require('../services/categoryService')

let categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
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
  },
  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '請輸入種類名稱')
      return res.redirect('back')
    } else {
      return Category.findByPk(req.params.id).then(category => {
        category.update({
          name: req.body.name
        }).then(category => {
          res.redirect('/admin/categories')
        })
      })
    }
  },
  deleteCategory: (req, res) => {
    categoryService.deleteCategory(req, res, (data) => {
      req.flash('error_messages', data['message'])
      return res.redirect('/admin/categories')
    })
  }
}

module.exports = categoryController