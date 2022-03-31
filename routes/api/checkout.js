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


        let product = await productDataLayer.getProductByID(i.get('product_id'));
        let brand = product.related('brand').get('name');

        // let brand = i.related('product').related('brand').get('name');
        let name = i.related('product').get('name');
        
        const lineItem = {
            'name': `${brand} ${name}`,
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
            // 'product_brand': i.related('product').related('brand').get('name'),
            // 'product_name': i.related('product').get('name'),
            'product_name': `${brand} ${name}`,
            'quantity': i.get('quantity'),
            'total_cost': i.get('quantity') * i.related('product').get('cost'),
            // 'image_url': i.related('product').get('image_url')
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
        },
        'shipping_options':[
            {
                'shipping_rate_data':{
                    'type': 'fixed_amount',
                    'fixed_amount':{
                        'amount': 300,
                        'currency': 'SGD'
                    },
                    'display_name': 'Ninja Van',
                    'delivery_estimate':{
                        'minimum':{
                            'unit': 'business_day',
                            'value': 3,
                        },
                        'maximum':{
                            'unit': 'business_day',
                            'value': 5
                        }
                    }
                }
            }
        ]
    }


    const stripeSession = await Stripe.checkout.sessions.create(payment);

    res.json(stripeSession)

})

router.post('/success/:sessionId', async function(req,res){

    let userId = req.body.user_id;

    // res.json("test")
    // let cart = new CartServices(userId);

    const userOrders = await orderDataLayer.getUserOrder(userId);
    // console.log(userOrders.get('items'), userOrders.get('amount'));
    // if (userOrders){

        // localStorage.setItem("order_viewed", "");

        const orders = JSON.parse(userOrders.get('items'));
        // let productId;
        // for (let o of orders){
        //     let orderQuantity = o.quantity;
        //     productId = o.product_id;
            
            // if (localStorage.getItem("order_viewed" != userOrders.id)){
            //     // auto update stock no
            //     let product = await productDataLayer.getProductByID(productId);
            //     let productQuantity = product.get('stock_no');
            //     let updatedStock = productQuantity - orderQuantity;

            //     console.log(productId, updatedStock)
            //     // console.log(orderQuantity, productQuantity, updatedStock)
            //     await cart.updateStockNo(productId, updatedStock)

            //     // empty user cart
            //     await cart.removeCartItem(productId);

            //     localStorage.setItem("order_viewed", userOrders.id);
            // }

        // }

        res.json({
            'order': userOrders.toJSON(),
            'orderItems': orders
        })
    // }
    // else{
    //     res.json("error")
    // }

})

router.post('/process_payment', express.raw({
    'type': 'application/json'
}), async function(req,res){
    let event = req.body;
    let endpoint = process.env.API_STRIPE_ENDPOINT_SECRET;
    let signHeader = req.headers['stripe-signature'];
    // let event;
    
    // if (endpoint){
    //     event = Stripe.webhooks.constructEvent(req.body, signHeader, endpoint)

    //     res.send({
    //         'received': true
    //     })
    // }

    // res.send(event.type)
    // try {
    //     event = Stripe.webhooks.constructEvent(payLoad, signHeader, endpoint)

    // } catch(e){
    //     res.send({
    //         'error': e.message
    //     })
    //     console.log(e)
    // }
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
                'total_cost': o.total_cost,
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

})

// router.get('/cancel', function(req,res){
//     // res.redirect('/cart')
//     res.json("Transaction cancelled")
// })

module.exports = router;