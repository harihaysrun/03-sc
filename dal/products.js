const { Product, Brand, Type, SkinType  } = require('../models');

async function getAllBrands(){
    
    const allBrands = await Brand.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allBrands;

}

async function getAllTypes(){
    
    const allTypes = await Type.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allTypes;

}

async function getAllSkinTypes(){
    
    const allSkinTypes = await SkinType.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allSkinTypes;

}

module.exports = { getAllBrands, getAllTypes, getAllSkinTypes }