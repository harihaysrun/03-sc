const express = require("express");
const router = express.Router();

// const orderDataLayer = require('../../dal/products');
const { OrderItem } = require('../../models');

router.post('/', async function(req,res){
    return await OrderItem.where({
        'user_id': req.body.user_id
    }).fetch({
        withRelated:['shipping', 'user']
    });
})


module.exports = router;
