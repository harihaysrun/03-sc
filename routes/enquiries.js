const express = require("express");
const router = express.Router();
const Handlebars = require('hbs');

Handlebars.registerHelper('toJSON', function(obj) {
    return JSON.stringify(obj, null, 3);
});

const { User, OrderItem, Enquiry } = require('../models');
const {bootstrapField, createShippingForm, createEnquirySearchForm } = require('../forms');

const orderDataLayer = require('../dal/orders');
const enquiryDataLayer = require('../dal/enquiries');
const { checkIfAuthenticated } = require('../middlewares');


router.get('/', checkIfAuthenticated, async function(req,res){

    const allReasons = await enquiryDataLayer.getAllReasons();
    allReasons.unshift([0, "Select one"]);
    const allStatus = await enquiryDataLayer.getEnquiryStatus();
    allStatus.unshift([0, "Select one"]);

    const searchForm = createEnquirySearchForm(allReasons, allStatus);

    let query = Enquiry.collection();
    searchForm.fields.reason_id.value = query.get('reason_id');
    searchForm.fields.status_id.value = query.get('status_id');

    searchForm.handle(req,{
        'empty':async function(form){
            let enquiries = await query.fetch({
                withRelated: ['reason', 'status']
            })

            if(req.session.user.role === 1){
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse(),
                    'admin': true
                })
            } else{
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse()
                })
            }
        },
        'success': async function(form){
            if (form.data.reason_id && form.data.reason_id != "0"){
                query.where('shipping_id', '=', req.query.reason_id)
            }
            if (form.data.status_id && form.data.status_id != "0"){
                query.where('shipping_id', '=', req.query.status_id)
            }

            // search the query
            let enquiries = await query.fetch({
                withRelated: ['reason', 'status']
            })

            if(req.session.user.role === 1){
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse(),
                    'admin': true
                });
            } else{
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse()
                });
            }

            
        },
        'error':async function(form){
            let enquiries = await query.fetch({
                withRelated: ['reason', 'status']
            })

            if(req.session.user.role === 1){
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse(),
                    'admin': true
                })
            } else{
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse()
                })
            }
            
        }
    })

    // res.render('enquiries/index')

})


router.get('/:order_id/update', checkIfAuthenticated, async function(req,res){

    const orderId = req.params.order_id;
    const order = await orderDataLayer.getOrderByID(orderId);

    const allShipping = await orderDataLayer.getShippingStatus();

    const shippingForm = createShippingForm(allShipping);

    shippingForm.fields.shipping_id.value = order.get('shipping_id');

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