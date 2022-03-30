const express = require("express");
const router = express.Router();

const productDataLayer = require('../../dal/products');
const { Product } = require('../../models');

router.get('/', async function(req,res){

    const allProducts = await productDataLayer.getAllProducts();
    const allBrands = await productDataLayer.getAllBrands();
    const allCountries = await productDataLayer.getAllCountries();
    const allTypes = await productDataLayer.getAllTypes();

    res.json({
        'products': allProducts,
        'brands': allBrands,
        'countries': allCountries,
        'types': allTypes
    })

    // res.send(await productDataLayer.getAllProducts())
})

router.post('/search', async function(req,res){

    let query = Product.collection();
    if (req.body.name){
        query.where('name', 'like', '%' + req.body.name + '%')
    }
    if(req.body.brand_id && req.body.brand_id != "0"){
        query.where('brand_id', '=', req.body.brand_id)
    }

    if(req.body.country_id && req.body.country_id != "0"){
        query.where('country_id', '=', req.body.country_id)
    }

    if(req.body.type_id && req.body.type_id != "0"){
        query.where('type_id', '=', req.body.type_id)
    }

    let products = await query.fetch({
        withRelated:['brand', 'country', 'type', 'skinTypes', 'status']
    })

    res.json({
        'products': products
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
