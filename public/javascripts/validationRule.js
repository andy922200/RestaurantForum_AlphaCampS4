// initialize express-validator
const { check, validationResult } = require('express-validator')

let registerFormCheck = [
  check('email')
    .isEmail().withMessage("請輸入正確的 Email 格式"),
  check('password')
    .isLength({ min: 8 }).withMessage("請至少輸入八位英數字")
]

module.exports = { registerFormCheck }