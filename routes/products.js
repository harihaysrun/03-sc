const express = require("express");
const router = express.Router();

const { Product } = require('../models');
const {bootstrapField, createProductForm } = require('../forms');

const productDataLayer = require('../dal/products')

router.get('/', async function(req,res){
    let products = await Product.collection().fetch({
        withRelated:['brand', 'skin_types']
    });
    res.render('products/index',{
        'products': products.toJSON()
    })
});

router.get('/create', async function(req,res){

    const allBrands = await productDataLayer.getAllBrands();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();

    const productForm = createProductForm(allBrands, allSkinTypes);

    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField)
    })
});

router.post('/create', async function(req,res){

    const allBrands = await productDataLayer.getAllBrands();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();

    const productForm = createProductForm(allBrands, allSkinTypes);
    
    productForm.handle(req,{
        'success':async function(form){
            const newProduct = new Product(form.data);
            // newProduct.set('name', form.data.name);
            // newProduct.set('name', form.data.name);
            // newProduct.set('cost', form.data.cost);
            // newProduct.set('description', form.data.description);
            // newProduct.set('ingredients', form.data.ingredients);
            // newProduct.set('expiry', form.data.expiry);
            await newProduct.save();
            
            if (form.data.skin_types) {
                let selectedSkinTypes = form.data.skin_types.split(',');
                // attach the product with the categories
                // which ids are in the array argument 
                await newProduct.tags().attach(selectedSkinTypes);
            }

            res.redirect('/products');
        },
        'error':function(form){
            res.render('products/create',{
                'form':form.toHTML(bootstrapField)
            })
        }
    })
});

router.get('/:product_id/update', async function(req,res){

    const productId = req.params.product_id;
    const product = await Product.where({
        'id':productId
    }).fetch({
        require:true,
        withRelated:['skin_types']
    })
    
    const allBrands = await productDataLayer.getAllBrands();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();

    const productForm = createProductForm(allBrands, allSkinTypes);

    productForm.fields.brand_id.value = product.get('brand_id');
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.ingredients.value = product.get('ingredients');
    productForm.fields.expiry.value = product.get('expiry');

   const selectedSkinTypes = await product.related('skin_types').pluck('id');
   productForm.fields.skin_type.value = selectedSkinTypes;

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })
    
});

router.post('/:product_id/update', async function(req,res){
    
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })
    
    const allBrands = await productDataLayer.getAllBrands();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();

    const productForm = createProductForm(allBrands, allSkinTypes);
    
    productForm.handle(req,{
        'success':async function(form){
            product.set(form.data);
            product.save();

            let skinTypeIds = skin_types.split(',');

            let existingSkinTypeIds = await product.related('skin_types').pluck('id');
            console.log("existingSkinTypeIds=",existingSkinTypeIds);
            
            let toRemove = existingSkinTypeIds.filter( function(id){
                return skinTypeIds.includes(id) === false;
            });
            
            console.log("toremove=", toRemove);
            await product.skinTypes().detach(toRemove);
            await product.skinTypes().attach(skinTypeIds)

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

router.get('/:product_id/delete', async function(req,res){

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

router.post('/:product_id/delete', async function(req,res){

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