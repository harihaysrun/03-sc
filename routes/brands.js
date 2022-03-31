const express = require("express");
const router = express.Router();

const { Brand } = require('../models');
const { bootstrapField, createBrandForm } = require('../forms');

const brandDataLayer = require('../dal/brands');
const { checkIfAuthenticated } = require('../middlewares');

router.get('/', checkIfAuthenticated, async function(req,res){

    const allBrands = await brandDataLayer.getAllBrands();
    console.log(allBrands)

    if(req.session.user.role === 1){
        res.render('brands/index',{
            'brands': allBrands.toJSON(),
            'admin':true
        })
    } else{
        res.render('brands/index',{
            'brands': allBrands.toJSON()
        })
    }

});


router.get('/add', checkIfAuthenticated, async function(req,res){

    const brandForm = createBrandForm();

    if(req.session.user.role === 1){
        res.render('brands/create',{
            'brandForm': brandForm.toHTML(bootstrapField),
            'admin': true
        })
    } else{
        res.render('brands/create',{
            'brandForm': brandForm.toHTML(bootstrapField)
        })
    }

})

router.post('/add', checkIfAuthenticated, async function(req,res){
    
    const brandForm = createBrandForm();

    brandForm.handle(req,{
        'success':async function(form){
            const newBrand = new Brand();
            newBrand.set('name', form.data.brand_name);
            await newBrand.save();

            req.flash("success_messages", `${newBrand.get('name')} has been added to the list`);

            res.redirect('/brands');
        },
        'error':function(form){
            res.render('brands/create',{
                'brandForm':brandForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:brand_id/update', checkIfAuthenticated, async function(req,res){

    const brandId = req.params.brand_id;
    const brand = await brandDataLayer.getBrandByID(brandId);
    const brandForm = createBrandForm();

    brandForm.fields.brand_name.value = brand.get('name');

    if(req.session.user.role === 1){
        res.render('brands/update', {
            'form': brandForm.toHTML(bootstrapField),
            'brand': brand.toJSON(),
            'admin': true
        })
    } else{
        res.render('brands/update', {
            'form': brandForm.toHTML(bootstrapField),
            'brand': brand.toJSON()
        })
    }

    
    
})

router.post('/:brand_id/update', checkIfAuthenticated, async function(req,res){
    const brandId = req.params.brand_id;
    const brand = await brandDataLayer.getBrandByID(brandId);
    const brandForm = createBrandForm();

    brandForm.handle(req,{
        'success':async function(form){
            brand.set('name', form.data.brand_name);
            brand.save();

            req.flash("success_messages", `${brand.get('name')} has been updated`);

            res.redirect('/brands');
        },
        'error':function(form){
            res.render('brands/update',{
                'form':form.toHTML(bootstrapField),
                'brand': brand.toJSON()
            })
        }
    })
});

router.get('/:brand_id/delete', checkIfAuthenticated, async function(req,res){
    const brandId = req.params.brand_id;
    const brand = await brandDataLayer.getBrandByID(brandId);

    if(req.session.user.role === 1){
        res.render('brands/delete', {
            'brand': brand.toJSON(),
            'admin': true
        })
    } else{
        res.render('brands/delete', {
            'brand': brand.toJSON()
        })
    }
    
})

router.post('/:brand_id/delete', checkIfAuthenticated, async function(req,res){
    const brandId = req.params.brand_id;
    const brand = await brandDataLayer.getBrandByID(brandId);
    
    await brand.destroy();
    req.flash("success_messages", `Brand successfully removed`);
    res.redirect('/brands');
})

module.exports = router;