const express = require("express");
const router = express.Router();

const { Product } = require('../models');
const {bootstrapField, createProductForm } = require('../forms');

router.get('/', async function(req,res){
    let products = await Product.collection().fetch();
    res.render('products/index',{
        'products': products.toJSON()
    })
});

router.get('/create', async function(req,res){
    const productForm = createProductForm();
    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField)
    })
});

router.post('/create', async function(req,res){
    const productForm = createProductForm();
    
    productForm.handle(req,{
        'success':async function(form){
            const newProduct = new Product();
            newProduct.set('name', form.data.name);
            newProduct.set('cost', form.data.cost);
            newProduct.set('description', form.data.description);
            newProduct.set('ingredients', form.data.ingredients);
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

module.exports = router;