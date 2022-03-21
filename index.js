const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const csrf = require('csurf');
const cors = require('cors');

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

app.use(cors());

app.use(session({
  store: new FileStore(),
  secret: process.env.SESSION_SECRET_KEY,
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

// app.use(csrf());
const csrfInstance = csrf();
app.use(function(req,res,next){
  if(req.url === "/checkout/process_payment"
    ||
    req.url.slice(0,5) === "/api/"
  ){
    return next()
  } else{
    csrfInstance(req,res,next);
  }
})

// app.use(function(req,res,next){
//   res.locals.csrfToken = req.csrfToken();
//   next();
// })

app.use(function(req,res,next){
  // check if curent request has csrf enabled or not
  if(req.csrfToken){
    res.locals.csrfToken = req.csrfToken();
  }
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


const homePage = require('./routes/landing');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary');
const cartRoutes = require('./routes/cart');
const brandRoutes = require('./routes/brands');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders');

const api = {
  'products': require('./routes/api/products'),
  'users': require('./routes/api/users')
}

async function main() {
  app.use('/', homePage);
  app.use('/products', productRoutes);
  app.use('/users', userRoutes);
  app.use('/cloudinary', cloudinaryRoutes);	
  app.use('/cart', cartRoutes);	
  app.use('/brands', brandRoutes);	
  app.use('/checkout', checkoutRoutes);	
  app.use('/orders', orderRoutes);	
  app.use('/api/products', express.json(), api.products)
  app.use('/api/users', express.json(), api.users);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});