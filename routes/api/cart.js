const express = require("express");
const router = express.Router();


const CartServices = require('../../services/cart_services');
const productDataLayer = require('../../dal/products');
const { checkIfAuthenticated } = require('../../middlewares');
const { Product } = require('../../models');

router.get('/', async function(req,res){
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
        withRelated:['brand', 'country', 'type', 'skinTypes', 'status']
    })

    // get current stock number
    let productQuantity = product.get('stock_no');

    if(quantity <= productQuantity) {

        // check if cart item with the same product id and user id is already in the database
        let cartServices = new CartServices(userId)
        await cartServices.addToCart(productId, quantity);

        res.json("Product has been added to cart")
        // req.flash('success_messages', 'Product has been added to cart');
        // res.redirect('/products');
    } else{
        res.json(`Only ${productQuantity} left in stock`)
        // req.flash('error_messages',`Only ${productQuantity} left in stock`);
        // res.redirect('/products');
    }

})

module.exports = router;
