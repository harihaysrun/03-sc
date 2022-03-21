const bookshelf = require('../bookshelf');

const Product = bookshelf.model('Product',{
    tableName:'products',
    brand(){
        return this.belongsTo('Brand')
    },
    country(){
        return this.belongsTo('Country')
    },
    type(){
        return this.belongsTo('Type')
    },
    skinTypes(){
        return this.belongsToMany('SkinType')
    },
    status(){
        return this.belongsTo('Status')
    }
})

const Brand = bookshelf.model('Brand',{
    tableName:'brands',
    products(){
        return this.hasMany('Product')
    }
})

const Country = bookshelf.model('Country',{
    tableName:'countries',
    products(){
        return this.hasMany('Product')
    }
})

const Type = bookshelf.model('Type',{
    tableName:'types',
    products(){
        return this.hasMany('Product')
    }
})

const SkinType = bookshelf.model('SkinType',{
    tableName:'skin_types',
    products(){
        return this.belongsToMany('Product')
    }
})

const Status = bookshelf.model('Status',{
    tableName:'status',
    products(){
        return this.hasMany('Product')
    }
})

const User = bookshelf.model('User',{
    tableName:'users',
})

const CartItem = bookshelf.model("CartItem",{
    'tableName': 'cart_items',
    product(){
        return this.belongsTo('Product')
    }
})

const OrderItem = bookshelf.model('OrderItem',{
    tableName:'orders',
    shipping(){
        return this.belongsTo('Shipping')
    },
    user(){
        return this.belongsTo('User')
    },
})

const Shipping = bookshelf.model('Shipping',{
    tableName:'shipping',
    orders(){
        return this.hasMany('OrderItem')
    }
})

const BlackListedToken = bookshelf.model('BlacklistedToken',{
    'tableName': 'blacklisted_tokens',
})

module.exports = { Product, Brand, Country, Type, SkinType, Status, User, CartItem, OrderItem, Shipping, BlackListedToken }