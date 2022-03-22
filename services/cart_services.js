const cartDataLayer = require('../dal/cart_items');
const productDataLayer = require('../dal/products');

class CartServices{

    constructor(user_id){
        this.user_id = user_id
    }

    async getAllCartItems(){
        return await cartDataLayer.getCart(this.user_id);
    }

    async addToCart(productId, quantity){
        let cartItem = await cartDataLayer.getCartItemByUserAndProduct(this.user_id, productId);
        if(cartItem){
            // cartItem.set('quantity', cartItem.get('quantity') + quantity);
            // await cartItem.save()

            return await cartDataLayer.updateItemQuantity(this.user_id, productId, cartItem.get('quantity') + quantity);

        } else{
            // todo: check whether there is enough stock
            return await cartDataLayer.createCartItem(this.user_id, productId, quantity);
        }
        // return cartItem;
    }

    async updateNewQuantity(productId, newQuantity){
        let cartItem = await cartDataLayer.getCartItemByUserAndProduct(this.user_id, productId);
        if(cartItem){
            return await cartDataLayer.updateItemQuantity(this.user_id, productId, cartItem.get('quantity') + newQuantity);
        }
    }

    async updateStockNo(productId, updatedStock){
        return await cartDataLayer.updateStock(productId, updatedStock);
    }

    async removeCartItem(productId){
        return await cartDataLayer.removeFromCart(this.user_id, productId);
    }

}

module.exports = CartServices;