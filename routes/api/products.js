const express = require("express");
const router = express.Router();

const productDataLayer = require('../../dal/products');
const { Product } = require('../../models');

router.get('/', async function(req,res){
    res.send(await productDataLayer.getAllProducts())
})

router.get('/products/:product_id', async function(req,res){

    let productId = req.params.product_id;
        
    const product = await Product.where({
        'id': productId
    }).fetch({
        require:true,
        withRelated:['country', 'type', 'skinTypes', 'status']
    })

    res.json({product})
})

module.exports = router;
