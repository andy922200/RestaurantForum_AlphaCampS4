const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const app = express()
const port = process.env.PORT || 3000
// load SQL database
const db = require('./models')

// initialize template engine
app.engine('handlebars', expressHandlebars({
  defaultLayout: 'main',
  helpers: require('./config/handlebarshelper')
}))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

// initialize method-override
app.use(methodOverride('_method'))

// initialize session and flash messages
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(flash())

// setup passport
const passport = require('./config/passport')
app.use(passport.initialize())
app.use(passport.session())

// load local variables
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})

// load restaurant image
app.use('/upload', express.static(__dirname + '/upload'))

// initialize routes settings
require('./routes')(app, passport)

// initialize app listener
app.listen(port, () => {
  db.sequelize.sync()
  console.log(`The app is listening on port ${port}`)
})