const express = require("express");
const router = express.Router();
const Handlebars = require('hbs');

Handlebars.registerHelper('toJSON', function(obj) {
    return JSON.stringify(obj, null, 3);
});

const { User, OrderItem } = require('../models');
const {bootstrapField, createShippingForm, createBrandForm, createOrderSearchForm } = require('../forms');

const orderDataLayer = require('../dal/orders');
const { checkIfAuthenticated } = require('../middlewares');


router.get('/', checkIfAuthenticated, async function(req,res){

    // const allOrders = await orderDataLayer.getAllOrders();

    const allShipping = await orderDataLayer.getShippingStatus();
    allShipping.unshift([0, "Select one"]);

    const searchForm = createOrderSearchForm(allShipping);

    let query = OrderItem.collection();
    searchForm.fields.shipping_id.value = query.get('shipping_id');

    searchForm.handle(req,{
        'empty':async function(form){
            let orders = await query.fetch({
                withRelated: ['user', 'shipping']
            })
            res.render('orders/index',{
                'searchForm': searchForm.toHTML(bootstrapField),
                'order': orders.toJSON().reverse()
            })
        },
        'success': async function(form){
            if (form.data.order_id){
                query.where('id', '=', req.query.order_id)
            }
            if (form.data.shipping_id && form.data.shipping_id != "0"){
                query.where('shipping_id', '=', req.query.shipping_id)
            }

            // search the query
            let orders = await query.fetch({
                withRelated: ['user', 'shipping']
            })

            res.render('orders/index',{
                'searchForm': searchForm.toHTML(bootstrapField),
                'order': orders.toJSON().reverse()
            });
        },
        'error':async function(form){
            let orders = await query.fetch({
                withRelated: ['user', 'shipping']
            })
            res.render('orders/index',{
                'searchForm': searchForm.toHTML(bootstrapField),
                'order': orders.toJSON().reverse()
            })
        }
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