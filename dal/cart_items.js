const { CartItem, Product } = require('../models');

const getCart = async function(userId){
    let allCartItems = await CartItem.collection()
        .where ({
            'user_id':userId
        }).fetch({
            'require':false,
            'withRelated': ['product']
        })

    return allCartItems;
}

const getCartItemByUserAndProduct = async function(userId, productId){
    const cartItem = await CartItem.where({
        'user_id': userId,
        'product_id': productId
    }).fetch({
        'require':false,
        'withRelated': ['product']
    });

    return cartItem;
}

const createCartItem = async function(userId, productId, quantity){
    const cartItem = new CartItem({
        'user_id':userId,
        'product_id': productId,
        'quantity':quantity
    })

    await cartItem.save()
    return cartItem;
}

const updateItemQuantity = async function(userId, productId, newQuantity){
    // let cartItem = await getCartItemByUserAndProduct(userId, productId);
    // const cartItem = await CartItem.where({
    //     'user_id': userId,
    //     'product_id': productId
    // }).fetch({
    //     'require':true,
    //     'withRelated': ['product']
    // });

    // if(cartItem){
    //     cartItem.set('quantity', newQuantity);
    //     await cartItem.save();
    //     return true;
    // }

    // return cartItem;
    let cartItem = await CartItem.where ({
            'user_id':userId,
            'product_id': productId
        }).fetch({
            'require':false,
            'withRelated': ['product']
        })

    return cartItem;
}

const updateStock = async function(productId, updatedStock){

    const product = await Product.where({
        'id': productId
    }).fetch({
        require:true,
    })

    product.set('stock_no', updatedStock);
    await product.save();

    return true;

    const allStatus = await Product.fetchAll().map(function(category){
        return [ category.get('id'), category.get('stock_no') ]
    })

    let cartItem = await getCartItemByUserAndProduct(userId, productId);
    if(cartItem){
        cartItem.set('quantity', updatedStock);
        await cartItem.save();
        return true;
    }
    return false;
}

const removeFromCart = async function(userId, productId){
    let cartItem = await getCartItemByUserAndProduct(userId, productId);
    if(cartItem){
        await cartItem.destroy();
        return true; // indicate that delete is successful
    } else{
        return false;
    }
}

module.exports = { getCart, getCartItemByUserAndProduct, createCartItem, updateItemQuantity, updateStock, removeFromCart }