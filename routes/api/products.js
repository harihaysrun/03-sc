const express = require("express");
const router = express.Router();

const productDataLayer = require('../../dal/products');
const { Product } = require('../../models');

router.get('/', async function(req,res){
    res.send(await productDataLayer.getAllProducts())
})

router.get('/search', async function(req,res){

    const allBrands = await productDataLayer.getAllBrands();
    const allCountries = await productDataLayer.getAllCountries();
    const allTypes = await productDataLayer.getAllTypes();

    res.json({
        'brands': allBrands,
        'countries': allCountries,
        'allTypes': allTypes
    })
    
})

router.get('/:product_id', async function(req,res){

    let productId = req.params.product_id;
        
    const product = await Product.where({
        'id': productId
    }).fetch({
        require:true,
        withRelated:['brand', 'country', 'type', 'skinTypes', 'status']
    })

    res.json({product})
})

module.exports = router;
