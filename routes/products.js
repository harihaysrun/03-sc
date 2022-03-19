const express = require("express");
const router = express.Router();

const { Product, Brand, SkinType } = require('../models');
const {bootstrapField, createProductForm } = require('../forms');

const productDataLayer = require('../dal/products');
const { checkIfAuthenticated } = require('../middlewares');

router.get('/', async function(req,res){
    let products = await Product.collection().fetch({
        withRelated:['brand', 'country', 'type', 'skinTypes', 'status']
    });
    res.render('products/index',{
        'products': products.toJSON()
    })
});

router.get('/create', checkIfAuthenticated, async function(req,res){

    const allBrands = await productDataLayer.getAllBrands();
    const allCountries = await productDataLayer.getAllCountries();
    const allTypes = await productDataLayer.getAllTypes();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();
    const allStatus = await productDataLayer.getAllStatus();

    const productForm = createProductForm(allBrands, allCountries, allTypes, allSkinTypes, allStatus);

    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField)
    })
    
});

router.post('/create', checkIfAuthenticated, async function(req,res){

    const allBrands = await productDataLayer.getAllBrands();
    const allCountries = await productDataLayer.getAllCountries();
    const allTypes = await productDataLayer.getAllTypes();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();
    const allStatus = await productDataLayer.getAllStatus();

    const productForm = createProductForm(allBrands, allCountries, allTypes, allSkinTypes, allStatus);
    
    productForm.handle(req,{
        'success':async function(form){
            const newProduct = new Product();
            newProduct.set('brand_id', form.data.brand_id);
            newProduct.set('name', form.data.name);
            newProduct.set('country_id', form.data.country_id);
            newProduct.set('type_id', form.data.type_id);
            newProduct.set('cost', form.data.cost);
            newProduct.set('description', form.data.description);
            newProduct.set('ingredients', form.data.ingredients);
            newProduct.set('expiry', form.data.expiry);
            newProduct.set('status_id', form.data.status_id);
            await newProduct.save();

            // console.log(form.data.skin_types)
            
            if (form.data.skin_types) {
                let selectedSkinTypes = form.data.skin_types.split(',');
                await newProduct.skinTypes().attach(selectedSkinTypes);
            }

            req.flash("success_messages", `New product ${newProduct.get('name')} has been created`);

            res.redirect('/products');
        },
        'error':function(form){
            res.render('products/create',{
                'form':form.toHTML(bootstrapField)
            })
        }
    })
});

router.get('/:product_id/update', checkIfAuthenticated, async function(req,res){

    const productId = req.params.product_id;
    const product = await Product.where({
        'id':productId
    }).fetch({
        require:true,
        withRelated:['country', 'type', 'skinTypes', 'status']
    })
    
    const allBrands = await productDataLayer.getAllBrands();
    const allCountries = await productDataLayer.getAllCountries();
    const allTypes = await productDataLayer.getAllTypes();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();
    const allStatus = await productDataLayer.getAllStatus();

    const productForm = createProductForm(allBrands, allCountries, allTypes, allSkinTypes, allStatus);

    productForm.fields.brand_id.value = product.get('brand_id');
    productForm.fields.name.value = product.get('name');
    productForm.fields.country_id.value = product.get('country_id');
    productForm.fields.type_id.value = product.get('type_id');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.ingredients.value = product.get('ingredients');
    productForm.fields.expiry.value = product.get('expiry');
    productForm.fields.status_id.value = product.get('status_id');

    const selectedSkinTypes = await product.related('skinTypes').pluck('id');
    productForm.fields.skin_types.value = selectedSkinTypes;

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })
    
});

router.post('/:product_id/update', checkIfAuthenticated, async function(req,res){
    
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true,
        withRelated:['country','type', 'skinTypes', 'status']
    })
    
    const allBrands = await productDataLayer.getAllBrands();
    const allCountries = await productDataLayer.getAllCountries();
    const allTypes = await productDataLayer.getAllTypes();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();
    const allStatus = await productDataLayer.getAllStatus();

    const productForm = createProductForm(allBrands, allCountries, allTypes, allSkinTypes, allStatus);
    
    productForm.handle(req,{
        'success':async function(form){
            product.set('brand_id', form.data.brand_id);
            product.set('name', form.data.name);
            product.set('country_id', form.data.country_id);
            product.set('type_id', form.data.type_id);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('ingredients', form.data.ingredients);
            product.set('expiry', form.data.expiry);
            product.set('status_id', form.data.status_id);
            // product.set(form.data);
            product.save();

            let skinTypeIds = form.data.skin_types.split(',');
            let existingSkinTypeIds = await product.related('skinTypes').pluck('id');
            
            let toRemove = existingSkinTypeIds.filter( function(id){
                return skinTypeIds.includes(id) === false;
            });
            
            // console.log("toremove=", toRemove);

            await product.skinTypes().detach(toRemove);
            await product.skinTypes().attach(skinTypeIds)

            req.flash("success_messages", `${product.get('name')} has been successfully edited`);

            res.redirect('/products');
        },
        'error':function(form){
            res.render('products/update',{
                'form':form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })
});

router.get('/:product_id/delete', checkIfAuthenticated, async function(req,res){

    const productId = req.params.product_id;
    const product = await Product.where({
        'id':productId
    }).fetch({
        require:true
    })

    res.render('products/delete', {
        'product': product.toJSON()
    })
    
});

router.post('/:product_id/delete', checkIfAuthenticated, async function(req,res){

    const productId = req.params.product_id;
    const product = await Product.where({
        'id':productId
    }).fetch({
        require:true
    })

    await product.destroy();
    res.redirect('/products');

});

module.exports = router;