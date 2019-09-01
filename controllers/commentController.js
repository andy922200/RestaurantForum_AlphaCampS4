const db = require('../models')
const Comment = db.Comment

let commentController = {
  postComment: (req, res) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    })
  },
  deleteComment: (req, res) => {
    return Comment.findByPk(req.params.id).then(comment => {
      comment.destroy()
        .then(comment => {
          res.redirect(`/restaurants/${comment.RestaurantId}`)
        })
    })
  }
}

module.exports = commentController