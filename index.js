const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const csrf = require('csurf');

require("dotenv").config();

const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

app.use(session({
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(flash());
app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
});

app.use(function(req, res, next){
  res.locals.user = req.session.user;
  next();
});

app.use(csrf());
app.use(function(req,res,next){
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use(function(err, req, res, next){
  if(err && err.code == "EBADCSRFTOKEN"){
    req.flash('error_messages', 'The form has expired. Please try again.')
    res.redirect('back')
  } else{
    next();
  }
})


const homePage = require('./routes/landing')
const productRoutes = require('./routes/products')
const userRoutes = require('./routes/users');

async function main() {
  app.use('/', homePage);
  app.use('/products', productRoutes);
  app.use('/users', userRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});