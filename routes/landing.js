const express = require("express");
const router = express.Router(); 

const brandDataLayer = require('../dal/brands');
const productDataLayer = require('../dal/products');
const userDataLayer = require('../dal/users');
const orderDataLayer = require('../dal/orders');

router.get('/', async function(req,res) {
    if(req.session.user){
        res.redirect('/dashboard');
    }
    res.redirect('/users/login');
})

router.get('/dashboard', async function(req,res) {

    const allProducts = await productDataLayer.getAllProducts();
    const allUsers = await userDataLayer.getAllUsers();
    const allEmployees = await userDataLayer.getAllEmployees();
    const allOrders = await orderDataLayer.getAllOrders();
    
    
    if(req.session.user && req.session.user.role === 1){
        res.render('landing/admin',{
            'products': allProducts.toJSON(),
            'users': allUsers.toJSON(),
            'employees': allEmployees.toJSON(),
            'orders': allOrders.toJSON().reverse()
        })
    } 

    if(req.session.user && req.session.user.role === 2){
        res.render('landing/manager',{
            'products': allProducts.toJSON(),
            'users': allUsers.toJSON(),
            'orders': allOrders.toJSON().reverse()
        })
    } 
})


module.exports = router;