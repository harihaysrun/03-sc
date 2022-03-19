const express = require("express");
const router = express.Router();

const { Product } = require('../models');
const {bootstrapField, createProductForm } = require('../forms');

const productDataLayer = require('../dal/products')

router.get('/', async function(req,res){
    let products = await Product.collection().fetch({
        withRelated:['brand']
    });
    res.render('products/index',{
        'products': products.toJSON()
    })
});

router.get('/create', async function(req,res){

    const allBrands = await productDataLayer.getAllBrands();
    const productForm = createProductForm(allBrands);

    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField)
    })
});

router.post('/create', async function(req,res){

    const allBrands = await productDataLayer.getAllBrands();
    const productForm = createProductForm(allBrands);
    
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
        require:true
    })
    
    const allBrands = await productDataLayer.getAllBrands();
    const productForm = createProductForm(allBrands);

    productForm.fields.brand_id.value = product.get('brand_id');
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.ingredients.value = product.get('ingredients');
    productForm.fields.expiry.value = product.get('expiry');

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
    const productForm = createProductForm(allBrands);
    
    productForm.handle(req,{
        'success':async function(form){
            product.set(form.data);
            product.save();
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