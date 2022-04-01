const express = require("express");
const router = express.Router();

const CartServices = require('../services/cart_services');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const productDataLayer = require('../dal/products');
const orderDataLayer = require('../dal/orders');

router.get('/', async function (req,res){
    // step 1: create the line items
    // each line item is one item the user has to pay for

    // 1. get all the items from current logged in user's shopping cart
    const cartServices = new CartServices(req.session.user.id);
    const items = await cartServices.getAllCartItems();

    // 2. for each item in the items array, create a line item
    const lineItems = [];
    const meta = [];
    for (let i of items){
        
        const lineItem = {
            'name': i.related('product').get('name'),
            'amount': i.related('product').get('cost') * 100,
            'quantity': i.get('quantity'),
            'currency': 'SGD'
        }

        if (i.related('product').get('image_url')){
            lineItem['images'] = [ i.related('product').get('image_url') ]
        }
        
        lineItems.push(lineItem)
        console.log(lineItem.amount)

        meta.push({
            'user_id': req.session.user.id,
            'product_id': i.get('product_id'),
            'quantity': i.get('quantity'),
            'image_url': i.related('product').get('image_url')
        })
    }

    // 2. create stripe payment and get the stripe session
    let metaData = JSON.stringify(meta);
    const payment = {
        'payment_method_types': ['card'],
        'line_items': lineItems,
        'success_url': process.env.STRIPE_SUCCESS_URL,
        'cancel_url': process.env.STRIPE_CANCEL_URL,
        'metadata':{
            'orders': metaData
        }
    }

    // 3. get session id from stripes
    const stripeSession = await Stripe.checkout.sessions.create(payment);
    res.render('checkout/checkout',{
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })

})

router.get('/success/:sessionId', async function(req,res){

    let cart = new CartServices(req.session.user.id);

    // console.log('req.session.user.id: ' + req.session.user.id)

    const userOrders = await orderDataLayer.getUserOrder(req.session.user.id);
    // console.log(userOrders.get('items'), userOrders.get('amount'));
    let orders = JSON.parse(userOrders.get('items'));
    let productId;
    for (let o of orders){
        let orderQuantity = o.quantity;
        productId = o.product_id;
        
        // auto update stock no
        let product = await productDataLayer.getProductByID(productId);
        let productQuantity = product.get('stock_no');
        let updatedStock = productQuantity - orderQuantity;

        console.log(productId, updatedStock)
        // console.log(orderQuantity, productQuantity, updatedStock)
        await cart.updateStockNo(productId, updatedStock)

        // empty user cart
        await cart.removeCartItem(productId);


    }

    // console.log(productId)


    res.render('checkout/success',{
        'order': userOrders.toJSON(),
        'orderItems': orders
    })
})

router.get('/cancel', function(req,res){
    res.redirect('/cart')
})

router.post('/process_payment', express.raw({
    'type': 'application/json'
}), async function(req,res){
    let payLoad = req.body;
    let endpoint = process.env.STRIPE_ENDPOINT_SECRET;
    let signHeader = req.headers['stripe-signature'];
    let event;

    try {
        event = Stripe.webhooks.constructEvent(payLoad, signHeader, endpoint)
        // console.log(event)
        // if no error, event should contain details of payment
    } catch(e){
        res.send({
            'error': e.message
        })
        console.log(e)
    }
    if (event.type == 'checkout.session.completed'){
        
        let stripeSession = event.data.object;
        console.log(stripeSession)
        let orders = JSON.parse(stripeSession.metadata.orders);
        let amountTotal = stripeSession.amount_total / 100;
        let paymentStatus = stripeSession.payment_status;
        
        let items = [];
        let itemsTextArray = [];
        let userId;
        
        for (let o of orders){
            userId = o.user_id;

            let product = await productDataLayer.getProductByID(o.product_id);
            let imageUrl = product.get('image_url');
            // let productName = product.get('name');
            let productBrand = product.related('brand').get('name');
            // let productCost = parseInt(product.get('cost'));
            // let productQuantity= parseInt(product.get('stock_no'));
            
            itemsText = `${o.quantity} x ${o.product_name}`;
            itemsTextArray.push(itemsText);

            // 'user_id': userId,
            // 'product_id': i.get('product_id'),
            // 'product_brand': i.related('product').related('brand').get('name'),
            // 'product_name': i.related('product').get('name'),
            // 'quantity': i.get('quantity'),
            // 'total_cost': i.get('quantity') * i.related('product').get('cost'),
            // 'image_url': i.rela

            orders = {
                'product_id': o.product_id,
                // 'product_brand': productBrand,
                'product_name': o.product_name,
                'quantity': o.quantity,
                'cost': o.total_cost,
                'total_cost': o.total_cost * o.quantity,
                'image_url': imageUrl
            };

            items.push(orders);

            // update stock no & remove items from cart
            // let product = await productDataLayer.getProductByID(o.product_id);
            let productQuantity= parseInt(product.get('stock_no'));
            let cart = new CartServices(userId);
            let updatedStock = productQuantity - o.quantity;
            await cart.updateStockNo(o.product_id, updatedStock)
            await cart.removeCartItem(o.product_id);
        }

        await orderDataLayer.createOrderItem(userId, JSON.stringify(items), itemsTextArray.join(', '), amountTotal, paymentStatus);
        
    }
    res.send({
        'received': true
    })
    // res.json({orders})

})

module.exports = router;