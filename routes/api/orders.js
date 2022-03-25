const express = require("express");
const router = express.Router();

const { OrderItem } = require('../../models');

router.post('/', async function(req,res){

    let ordersArray = [];
    let order = await OrderItem.collection().where({
        'user_id': req.body.user_id
    }).fetch({
        withRelated:['shipping', 'user']
    });

    ordersArray.push(order)

    res.send(ordersArray)
})

module.exports = router;
