const { Product, Brand, Country, Type, SkinType, Status  } = require('../models');

async function getAllBrands(){
    
    const allBrands = await Brand.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allBrands;

}

async function getAllCountries(){
    
    const allCountries = await Country.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allCountries;

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

async function getAllStatus(){
    
    const allStatus = await Status.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allStatus;

}

module.exports = { getAllBrands, getAllCountries, getAllTypes, getAllSkinTypes, getAllStatus }