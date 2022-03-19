const express = require("express");
const router = express.Router(); 

const productDataLayer = require('../dal/brands');

router.get('/', async function(req,res) {

    const allBrands = await productDataLayer.getAllBrands();
    // console.log(allBrands.length)
    res.render('landing/index',{
        'brands': allBrands.toJSON()
    })

})

// router.get('/products', function(req,res) {
//     res.render('products/index')
// })


module.exports = router;