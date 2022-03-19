const bookshelf = require('../bookshelf');

const Product = bookshelf.model('Product',{
    tableName:'products',
    brand(){
        return this.belongsTo('Brand')
    },
    type(){
        return this.belongsTo('Type')
    },
    skinTypes(){
        return this.belongsToMany('SkinType')
    },
    status(){
        return this.belongsTo('Status')
    },
})

const Brand = bookshelf.model('Brand',{
    tableName:'brands',
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


module.exports = { Product, Brand, Type, SkinType, Status }