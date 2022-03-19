const { Product, Brand, SkinType  } = require('../models');

async function getAllBrands(){
    
    const allBrands = await Brand.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allBrands;

}

async function getAllSkinTypes(){
    
    const allSkinTypes = await SkinType.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allSkinTypes;

}

module.exports = { getAllBrands, getAllSkinTypes }