const bookshelf = require('../bookshelf');

const Product = bookshelf.model('Product',{
    tableName:'products',
    brand(){
        return this.belongsTo('Brand')
    }
})

const Brand = bookshelf.model('Brand',{
    tableName:'brands',
    products(){
        return this.hasMany('Product')
    }
})


module.exports = { Product, Brand }