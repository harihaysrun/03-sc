const express = require("express");
const router = express.Router();
const Handlebars = require('hbs');

Handlebars.registerHelper('toJSON', function(obj) {
    return JSON.stringify(obj, null, 3);
});

const { User, OrderItem, Enquiry, RepliedEnquiry } = require('../models');
const {bootstrapField, createShippingForm, createEnquirySearchForm } = require('../forms');

const orderDataLayer = require('../dal/orders');
const enquiryDataLayer = require('../dal/enquiries');
const { checkIfAuthenticated } = require('../middlewares');


router.get('/', checkIfAuthenticated, async function(req,res){

    const allReasons = await enquiryDataLayer.getAllReasons();
    allReasons.unshift([0, "Select one"]);

    allRepliedEnquiries =  await enquiryDataLayer.getAllRepliedEnquiries();

    const searchForm = createEnquirySearchForm(allReasons);

    let query = Enquiry.collection();
    searchForm.fields.reason_id.value = query.get('reason_id');

    searchForm.handle(req,{
        'empty':async function(form){
            let enquiries = await query.fetch({
                withRelated: ['reason']
            })

            if(req.session.user.role === 1){
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse(),
                    'replied': allRepliedEnquiries.toJSON(),
                    'admin': true
                })
            } else{
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse(),
                    'replied': allRepliedEnquiries.toJSON()
                })
            }
        },
        'success': async function(form){
            if (form.data.reason_id && form.data.reason_id != "0"){
                query.where('reason_id', '=', req.query.reason_id)
            }
            if (form.data.status_id && form.data.status_id != "0"){
                query.where('status_id', '=', req.query.status_id)
            }

            // search the query
            let enquiries = await query.fetch({
                withRelated: ['reason']
            })
            
            if(req.session.user.role === 1){
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse(),
                    'replied': allRepliedEnquiries.toJSON(),
                    'admin': true
                });
            } else{
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse(),
                    'replied': allRepliedEnquiries.toJSON()
                });
            }

            
        },
        'error':async function(form){
            let enquiries = await query.fetch({
                withRelated: ['reason']
            })

            if(req.session.user.role === 1){
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse(),
                    'replied': allRepliedEnquiries.toJSON(),
                    'admin': true
                })
            } else{
                res.render('enquiries/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'enquiry': enquiries.toJSON().reverse(),
                    'replied': allRepliedEnquiries.toJSON()
                })
            }
            
        }
    })



    // const allEnquiries = await enquiryDataLayer.getAllEnquiries();

    // res.json(allEnquiries)

})


router.get('/:enquiry_id/delete', checkIfAuthenticated, async function(req,res){

    const id = req.params.enquiry_id;
    const enquiry = await enquiryDataLayer.getEnquiryById(id);

    if(req.session.user.role === 1){
        res.render('enquiries/delete', {
            'enquiry': enquiry.toJSON(),
            'admin':true
        })
    } else{
        res.render('enquiries/delete', {
            'enquiry': enquiry.toJSON()
        })
    }
    
});


router.post('/:enquiry_id/delete', checkIfAuthenticated, async function(req,res){

    // const productId = req.params.product_id;
    // const product = await Product.where({
    //     'id':productId
    // }).fetch({
    //     require:true
    // })

    const id = req.params.enquiry_id;
    const enquiry = await enquiryDataLayer.getEnquiryById(id);

    // res.json(enquiry.related('reason').get('name'),)

    const repliedEnquiry = new RepliedEnquiry({
        'enquiry_id': enquiry.get('id'),
        'name':enquiry.get('name'),
        'email': enquiry.get('email'),
        'reason': enquiry.related('reason').get('name'),
        'title': enquiry.get('title'),
        'message':enquiry.get('message'),
        'replied_by': req.session.user.username,
        'role': req.session.user.role_name
    })

    await repliedEnquiry.save();


    // // res.sendStatus(200)
    // // res.json(repliedEnquiry)

    await enquiry.destroy();
    res.redirect('/enquiries');

});

module.exports = router;