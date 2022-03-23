const express = require("express");
const router = express.Router();

const CartServices = require('../../services/cart_services');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const productDataLayer = require('../../dal/products');
const orderDataLayer = require('../../dal/orders');

router.post('/', async function (req,res){

    let userId = req.body.user_id;
    const cartServices = new CartServices(userId);
    const items = await cartServices.getAllCartItems();

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
            'user_id': userId,
            'product_id': i.get('product_id'),
            'quantity': i.get('quantity'),
            'image_url': i.related('product').get('image_url')
        })
    }

    let metaData = JSON.stringify(meta);
    const payment = {
        'payment_method_types': ['card'],
        'line_items': lineItems,
        'success_url': process.env.API_STRIPE_SUCCESS_URL,
        'cancel_url': process.env.API_STRIPE_CANCEL_URL,
        'metadata':{
            'orders': metaData
        }
    }

    const stripeSession = await Stripe.checkout.sessions.create(payment);
    // res.render('checkout/checkout',{
    //     'sessionId': stripeSession.id,
    //     'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    // })

    // const stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);

    // let response = await stripe.redirectToCheckout({
    //     'sessionId': stripeSession.id
    // });

    res.json(stripeSession)
    // res.redirect(stripeSession.url)
    // res.writeHead({
    //     Location: stripeSession.url
    // })

})

router.get('/success/:sessionId', async function(req,res){

    // let userId = req.body.user_id;
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


    res.render('checkout/success',{
        'order': userOrders.toJSON(),
        'orderItems': orders
    })
})

router.post('/process_payment', express.raw({
    'type': 'application/json'
}), async function(req,res){
    let payLoad = req.body;
    let endpoint = process.env.API_STRIPE_ENDPOINT_SECRET;
    let signHeader = req.headers['stripe-signature'];
    let event;

    try {
        event = Stripe.webhooks.constructEvent(payLoad, signHeader, endpoint)

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
            let productName = product.get('name');
            
            itemsText = `${o.quantity} x ${productName}`;
            itemsTextArray.push(itemsText);

            orders = {
                'quantity': o.quantity,
                'product_id': o.product_id,
                'product_name': productName,
                'image_url': o.image_url
            };

            items.push(orders);
        }

        await orderDataLayer.createOrderItem(userId, JSON.stringify(items), itemsTextArray.join(', '), amountTotal, paymentStatus);
        // console.log(orderItem)
    }
    res.send({
        'received': true
    })

})

router.get('/cancel', function(req,res){
    // res.redirect('/cart')
    res.json("Transaction cancelled")
})

module.exports = router;