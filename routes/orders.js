const express = require("express");
const router = express.Router();
const Handlebars = require('hbs');

Handlebars.registerHelper('toJSON', function(obj) {
    return JSON.stringify(obj, null, 3);
});

const { User } = require('../models');
const {bootstrapField, createShippingForm, createBrandForm } = require('../forms');

const orderDataLayer = require('../dal/orders');
const { checkIfAuthenticated } = require('../middlewares');


router.get('/', checkIfAuthenticated, async function(req,res){

    const allOrders = await orderDataLayer.getAllOrders();
    const allShipping = await orderDataLayer.getShippingStatus();

    // console.log(allOrders.get('items'))
    
    // const userOrders = await orderDataLayer.getUserOrder(req.session.user.id);

    // // let orders = JSON.parse(userOrders.get('items'));
    // console.log(allOrders.length)

    // let orderQuantity;
    // let productName;
    let items;
    let quantity;
    let productName;

    let itemz;
    
    for (let o of allOrders){
        // console.log(o.attributes.items)
        items = JSON.parse(o.attributes.items);
        // console.log(items.length)
        // quantity = items[o].quantity;
        // productName = items[o].product_name;
        // productId = o.product_id;
        // console.log(o.attributes)

        for (i=0; i < items.length; i++){
            quantity = items[i].quantity;
            productName = items[i].product_name;
        }

        itemz = `${quantity} x ${productName}`;

        // console.log(quantity, productName)

    }

    // console.log(allOrders)

    // // for (i=0; i < allOrders.length; i++){
    // //     items = allOrders[i].attributes.items;
    // //     console.log(items)
    // // }

    res.render('orders/index',{
        'order': allOrders.toJSON(),
        'itemz': itemz
        // 'quantity': quantity,
        // 'productName': productName,
        // 'items': 
        // 'shippingForm': brandForm.toHTML(bootstrapField)
    })

})


router.get('/:order_id/update', checkIfAuthenticated, async function(req,res){

    const orderId = req.params.order_id;
    const order = await orderDataLayer.getOrderByID(orderId);

    const allShipping = await orderDataLayer.getShippingStatus();

    const shippingForm = createShippingForm(allShipping);

    shippingForm.fields.shipping_id.value = order.get('shipping_id');

    res.render('orders/update', {
        'form': shippingForm.toHTML(bootstrapField),
        'order': order.toJSON()
    })
    
});

router.post('/:order_id/update', checkIfAuthenticated, async function(req,res){

    const orderId = req.params.order_id;
    const order = await orderDataLayer.getOrderByID(orderId);

    const allShipping = await orderDataLayer.getShippingStatus();

    const shippingForm = createShippingForm(allShipping);

    shippingForm.handle(req,{
        'success':async function(form){
            order.set('shipping_id', form.data.shipping_id);
            order.save();

            req.flash("success_messages", `Shipping status has been changed for Order #${order.get('id')}`);

            res.redirect('/orders');
        },
        'error':function(form){
            res.render('orders/update',{
                'form':form.toHTML(bootstrapField),
                'order': order.toJSON()
            })
        }
    })
});

module.exports = router;