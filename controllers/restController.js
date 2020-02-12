const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

let restController = {
  getRestaurants: (req, res) => {
    let whereQuery = {}
    let categoryId = ''
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }
    Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit })
      .then(result => {
        /*分頁功能參數*/
        let page = Number(req.query.page) || 1
        let pages = Math.ceil(result.count / pageLimit)
        let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
        let prev = page - 1 < 1 ? 1 : page - 1
        let next = page + 1 > pages ? pages : page + 1

        const data = result.rows.map(r => ({
          ...r.dataValues,
          description: r.dataValues.description.substring(0, 50),
          isFavorite: req.user.FavoriteRestaurants.map(d => d.id).includes(r.id),
          isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
        }))
        Category.findAll().then(categories => {
          return res.render('restaurants', JSON.parse(JSON.stringify(
            {
              restaurants: data,
              categories: categories,
              categoryId: categoryId,
              page: page,
              totalPage: totalPage,
              prev: prev,
              next: next
            }
          )))
        })
      })
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoriteUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    })
      .then(restaurant => {
        return restaurant.increment('viewCount', { by: 1 })
      }).then(restaurant => {
        const isFavorite = restaurant.FavoriteUsers.map(d => d.id).includes(req.user.id)
        const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
        return res.render('restaurant', JSON.parse(JSON.stringify({ restaurant: restaurant, isFavorite: isFavorite, isLiked: isLiked })))
      })
  },
  getFeeds: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [Category]
    }).then(restaurants => {
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      }).then(comments => {
        return res.render('feeds', JSON.parse(JSON.stringify({ restaurants: restaurants, comments: comments })))
      })
    })
  },
  getDashboard: (req, res) => {
    return Restaurant.findAndCountAll({
      where: { id: req.params.id },
      include: [Comment, Category]
    }).then(result => {
      let restaurant = result.rows[0]["dataValues"]
      let commentCounts = restaurant.Comments.length
      return res.render('dashboard', JSON.parse(JSON.stringify({ restaurant: restaurant, commentCounts: commentCounts })))
    })
  },
  getTopRestaurants: (req, res) => {
    // 取出所有的 Restaurant 和 FavoriteUser 資料
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoriteUsers' }]
    }).then(restaurants => {
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.description.substring(0, 50),
        FavoriteCount: restaurant.FavoriteUsers.length,
        isFavorite: req.user.FavoriteRestaurants.map(r => r.id).includes(restaurant.id)
      }))
      // 依追蹤者數量排序
      restaurants = restaurants.sort((a, b) => b.FavoriteCount - a.FavoriteCount)
      // 取出前10個
      restaurants = restaurants.slice(0, 10)
      return res.render('topRestaurant', { restaurants: restaurants })
    })
  }
}

module.exports = restController