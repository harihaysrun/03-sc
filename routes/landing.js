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
    const allOrders = await orderDataLayer.getAllOrders();
    
    res.render('landing/index',{
        'brands': allBrands.toJSON(),
        'users': allUsers.toJSON(),
        'orders': allOrders.toJSON()
    })

})

module.exports = router;