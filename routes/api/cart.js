const express = require("express");
const router = express.Router();

const CartServices = require('../../services/cart_services');
const productDataLayer = require('../../dal/products');
const { checkIfAuthenticatedWithJWT } = require('../../middlewares');
const { Product } = require('../../models');

router.post('/', async function(req,res){
    // let userId = req.session.user.id;
    let userId = req.body.user_id;
    const cartServices = new CartServices(userId);
    const allCartItems = await cartServices.getAllCartItems();
    res.json({
        'cartItems': allCartItems.toJSON()
    })
})

router.post('/:product_id/add', async function(req,res){

    // let userId = req.session.user.id;
    let userId = req.body.user_id;
    let productId = req.params.product_id;
    let quantity = req.body.quantity_to_add;
        
    const product = await Product.where({
        'id': productId
    }).fetch({
        require:true,
        withRelated:['brand', 'country', 'type', 'skinTypes', 'status']
    })

    // get current stock number
    let productQuantity = product.get('stock_no');

    if(quantity <= productQuantity) {

        // check if cart item with the same product id and user id is already in the database
        let cartServices = new CartServices(userId)
        await cartServices.addToCart(productId, quantity);
        res.json("Product has been added to cart")
    } else{
        res.json(`Only ${productQuantity} left in stock`);
    }

})

router.post('/:product_id/update', async function(req,res){

    let userId = req.body.user_id;
    let productId = req.params.product_id;
    let productQuantity = req.body.quantity;
    let newQuantity = req.body.newQuantity;

    if (newQuantity <= productQuantity){
        const cartServices = new CartServices(userId);
        await cartServices.updateNewQuantity(productId, newQuantity);
        // res.json(product)
        res.json("Product quantity has been updated")
    } else{
        // res.json(`Only ${productQuantity} left in stock`);
        res.json({
            'stock':'not enough'
        });
    }
})

router.post('/:product_id/remove', async function(req,res){

    let userId = req.body.user_id;
    let productId = req.params.product_id;

    let cart = new CartServices(userId);
    await cart.removeCartItem(productId);
    res.json("Item has been removed from cart");
})

module.exports = router;
