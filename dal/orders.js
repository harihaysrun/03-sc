const { OrderItem, Product } = require('../models');

const createOrderItem = async function( userId, items, amount, paymentStatus){
    const orderItem = new OrderItem({
        'user_id':userId,
        'date': new Date(),
        'items': items,
        'amount': amount,
        'payment_status': paymentStatus,
    })

    await orderItem.save()
    return orderItem;
}

async function getAllOrders(){
    
    const allOrders = await OrderItem.collection().fetch();
    return allOrders;

}

async function getUserOrder(userId){
    
    // const order = await OrderItem.where({
    //     'user_id':parseInt(userId)
    // }).fetch({
    //     require:true,
    // })

    // return order;


    const order = await OrderItem.query(function(qb){
        qb.orderBy('id', 'DESC')
    }).where({
        'user_id':parseInt(userId)
    }).fetch({
        require:true,
    })


    return order;
}

module.exports = { createOrderItem, getAllOrders, getUserOrder }