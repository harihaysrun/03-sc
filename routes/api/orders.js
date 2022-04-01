const express = require("express");
const router = express.Router();

const { OrderItem } = require('../../models');

router.post('/', async function(req,res){

    let orders = await OrderItem.collection().query(function(qb){
        qb.orderBy('id', 'DESC')
    }).where({
        'user_id': req.body.user_id
    }).fetch({
        withRelated:['shipping', 'user']
    });

    res.send(orders)
})

module.exports = router;
