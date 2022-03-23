const express = require("express");
const router = express.Router();

const CartServices = require('../../services/cart_services');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

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
            'user_id': req.session.user.id,
            'product_id': i.get('product_id'),
            'quantity': i.get('quantity'),
            'image_url': i.related('product').get('image_url')
        })
    }

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

    const stripeSession = await Stripe.checkout.sessions.create(payment);
    res.render('checkout/checkout',{
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })

})

module.exports = router;