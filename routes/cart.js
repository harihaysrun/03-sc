const express = require('express');
const { checkIfAuthenticated } = require('../middlewares');
const router = express.Router();

const { Product } = require('../models');

const CartServices = require('../services/cart_services');
const productDataLayer = require('../dal/products');

router.get('/', checkIfAuthenticated, async function(req,res){
    let userId = req.session.user.id;
    const cartServices = new CartServices(userId);
    const allCartItems = await cartServices.getAllCartItems();
    res.render('cart/index',{
        'cartItems': allCartItems.toJSON()
    })
})

router.get('/:product_id/add', checkIfAuthenticated, async function(req,res){

    let userId = req.session.user.id;
    let productId = req.params.product_id;
    let quantity = 1;

        
    const product = await Product.where({
        'id': productId
    }).fetch({
        require:true,
        withRelated:['country', 'type', 'skinTypes', 'status']
    })

    console.log(product.attributes.stock_no)

    let currentStockNo = product.attributes.stock_no;
    let updatedStockNo = currentStockNo - quantity;

    console.log(currentStockNo, updatedStockNo)


    // check if cart item with the same product id and user id is already in the database
    let cartServices = new CartServices(userId)
    await cartServices.addToCart(productId, quantity);


    // todo: check if there's enough stock
    req.flash('success_messages', 'Product has been added to cart');
    res.redirect('/products');

})

router.post('/:product_id/update', checkIfAuthenticated, async function(req,res){

    // get current stock number
    let product = await productDataLayer.getProductByID(req.params.product_id,);
    let productQuantity = product.get('stock_no');

    let newQuantity = req.body.newQuantity;

    if (newQuantity <= productQuantity){
        const cartServices = new CartServices(req.session.user.id);
        await cartServices.updateNewQuantity(req.params.product_id, newQuantity);
        req.flash('success_messages', 'Quantity has been updated');
        res.redirect('/cart');
    } else{
        req.flash('error_messages',`Only ${productQuantity} left in stock`);
        res.redirect('/cart');
    }
})

router.get('/:product_id/remove', checkIfAuthenticated, async function(req,res){
    let cart = new CartServices(req.session.user.id);
    await cart.removeCartItem(req.params.product_id);
    req.flash('success_messages', 'Item has been removed from cart');
    res.redirect('/cart');
})


module.exports = router;