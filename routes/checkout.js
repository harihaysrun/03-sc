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
        'payment_method_types': ['card', 'grabpay'],
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

    // console.log('req.session.user.id: ' + req.session.user.id)

    const userOrders = await orderDataLayer.getUserOrder(req.session.user.id);
    // console.log(userOrders.get('items'), userOrders.get('amount'));

    res.render('checkout/success',{
        'order': userOrders.toJSON(),
        'orderItems': JSON.parse(userOrders.get('items'))
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
        // console.log(orders, amountTotal, paymentStatus)
        // console.log(orders,orders.length)
        let items = [];
        let userId;
        
        for (let o of orders){
            userId = o.user_id;
            let product = await productDataLayer.getProductByID(o.product_id);
            let productName = product.get('name');
            
            // orders = `${o.quantity} x ${productName}`;

            orders = {
                'quantity': o.quantity,
                'product_id': o.product_id,
                'product_name': productName,
                'image_url': o.image_url
            };

            items.push(orders);
        }

        console.log(JSON.stringify(items))
        // console.log('userId:' + userId)
        // console.log(items.toString())

        // console.log(orders)
        // 1. create a model to represent each invoice item
        // - create migration file
        // - create the models
        // for each line item, store the quantity order

        // await orderDataLayer.createOrderItem(userId, items.join(', '), amountTotal, paymentStatus);
        await orderDataLayer.createOrderItem(userId, JSON.stringify(items), amountTotal, paymentStatus);
        // console.log(orderItem)
    }
    res.send({
        'received': true
    })
    // res.json({orders})

})

module.exports = router;