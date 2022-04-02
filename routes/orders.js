const express = require("express");
const router = express.Router();
const Handlebars = require('hbs');

Handlebars.registerHelper('toJSON', function(obj) {
    return JSON.stringify(obj, null, 3);
});

const { User, OrderItem } = require('../models');
const {bootstrapField, createUpdateForm, createBrandForm, createOrderSearchForm } = require('../forms');

const orderDataLayer = require('../dal/orders');
const { checkIfAuthenticated } = require('../middlewares');


router.get('/', checkIfAuthenticated, async function(req,res){

    const allShipping = await orderDataLayer.getShippingStatus();
    allShipping.unshift([0, "Select one"]);

    const searchForm = createOrderSearchForm(allShipping);

    let query = OrderItem.collection();
    searchForm.fields.shipping_id.value = query.get('shipping_id');

    searchForm.handle(req,{
        'empty':async function(form){
            let orders = await query.query(function(qb){
                            qb.orderBy('id', 'DESC')
                        }).fetch({
                            withRelated: ['user', 'shipping']
                        })

            if(req.session.user.role === 1){
                res.render('orders/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'order': orders.toJSON(),
                    'admin': true
                })
            } else{
                res.render('orders/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'order': orders.toJSON()
                })
            }
        },
        'success': async function(form){
            if (form.data.order_id){
                query.where('id', '=', req.query.order_id)
            }
            if (form.data.shipping_id && form.data.shipping_id != "0"){
                query.where('shipping_id', '=', req.query.shipping_id)
            }

            // search the query
            let orders = await query.query(function(qb){
                            qb.orderBy('id', 'DESC')
                        }).fetch({
                            withRelated: ['user', 'shipping']
                        })

            if(req.session.user.role === 1){
                res.render('orders/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'order': orders.toJSON(),
                    'admin': true
                });
            } else{
                res.render('orders/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'order': orders.toJSON()
                });
            }

            
        },
        'error':async function(form){
            let orders = await query.query(function(qb){
                            qb.orderBy('id', 'DESC')
                        }).fetch({
                            withRelated: ['user', 'shipping']
                        })

            if(req.session.user.role === 1){
                res.render('orders/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'order': orders.toJSON(),
                    'admin': true
                })
            } else{
                res.render('orders/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'order': orders.toJSON()
                })
            }
            
        }
    })

})


router.get('/:order_id/update', checkIfAuthenticated, async function(req,res){

    const orderId = req.params.order_id;
    const order = await orderDataLayer.getOrderByID(orderId);

    const allShipping = await orderDataLayer.getShippingStatus();

    const shippingForm = createUpdateForm(allShipping);

    shippingForm.fields.shipping_id.value = order.get('shipping_id');
    shippingForm.fields.tracking_url.value = order.get('tracking');

    if(req.session.user.role === 1){
        res.render('orders/update', {
            'form': shippingForm.toHTML(bootstrapField),
            'order': order.toJSON(),
            'admin': true
        })
    }else{
        res.render('orders/update', {
            'form': shippingForm.toHTML(bootstrapField),
            'order': order.toJSON()
        })
    }
    
});

router.post('/:order_id/update', checkIfAuthenticated, async function(req,res){

    const orderId = req.params.order_id;
    const order = await orderDataLayer.getOrderByID(orderId);

    const allShipping = await orderDataLayer.getShippingStatus();

    const shippingForm = createUpdateForm(allShipping);

    shippingForm.handle(req,{
        'success':async function(form){
            order.set('shipping_id', form.data.shipping_id);
            order.set('tracking', form.data.tracking_url);
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