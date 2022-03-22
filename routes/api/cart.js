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
    let quantity = 1;
        
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

    // const product = await Product.where({
    //     'id': productId
    // }).fetch({
    //     require:true,
    //     withRelated:['brand', 'country', 'type', 'skinTypes', 'status']
    // })

    // // // get current stock number
    // let product = await productDataLayer.getProductByID(req.params.product_id);
    // console.log(product)
    // res.json(product)
    // let productQuantity = product.get('stock_no');

    // res.json(`${userId}, ${productId}, ${newQuantity}, ${productQuantity}`)


    // // res.json(`${newQuantity}, ${productQuantity}`)

    if (newQuantity <= productQuantity){
        const cartServices = new CartServices(userId);
        let product = await cartServices.updateNewQuantity(productId, newQuantity);
        res.json(product)
        // res.json("Product quantity has been updated")
    } else{
        res.json(`Only ${productQuantity} left in stock`);
    }
})

module.exports = router;
