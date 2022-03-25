const express = require("express");
const router = express.Router();

const { OrderItem } = require('../../models');

router.post('/', async function(req,res){
    let order = await OrderItem.where({
        'user_id': req.body.user_id
    }).fetch({
        withRelated:['shipping', 'user']
    });

    res.send(order)
})

module.exports = router;
