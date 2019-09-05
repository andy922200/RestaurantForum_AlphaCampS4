const db = require('../models')
const Category = db.Category

let categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll().then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then((category) => {
            callback({ categories: categories, category: category })
          })
      } else {
        return Category.findAll().then(categories => {
          callback({ categories: categories })
        })
      }
    })
  },
  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: '請輸入種類名稱' })
    } else {
      return Category.create({
        name: req.body.name
      }).then((category => {
        callback({ status: 'success', message: '類別已新增' })
      }))
    }
  },
  deleteCategory: (req, res, callback) => {
    return Category.findByPk(req.params.id).then(category => {
      category.destroy()
        .then(category => {
          callback({ status: 'success', message: '類別已刪除' })
        })
    })
  }
}


module.exports = categoryService