const express = require("express");
const router = express.Router();

const productDataLayer = require('../../dal/products');

router.get('/', async function(req,res){
    res.send(await productDataLayer.getAllProducts())
})

module.exports = router;
