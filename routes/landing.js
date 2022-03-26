const express = require("express");
const router = express.Router(); 

const productDataLayer = require('../dal/brands');
const userDataLayer = require('../dal/users');
const orderDataLayer = require('../dal/orders');

router.get('/', async function(req,res) {
    if(req.session.user){
        res.redirect('/dashboard');
    }
    res.redirect('/users/login');
})

router.get('/dashboard', async function(req,res) {

    const allBrands = await productDataLayer.getAllBrands();
    const allUsers = await userDataLayer.getAllUsers();
    const allEmployees = await userDataLayer.getAllEmployees();
    const allOrders = await orderDataLayer.getAllOrders();
    
    if(req.session.user && req.session.user.role === 1){
        res.render('landing/admin',{
            'brands': allBrands.toJSON(),
            'users': allUsers.toJSON(),
            'employees': allEmployees.toJSON(),
            'orders': allOrders.toJSON()
        })
    } 

    if(req.session.user && req.session.user.role === 2){
        res.render('landing/manager',{
            'brands': allBrands.toJSON(),
            'users': allUsers.toJSON(),
            'orders': allOrders.toJSON()
        })
    } 
})

module.exports = router;