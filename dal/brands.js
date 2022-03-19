const { Brand } = require('../models');

async function getAllBrands(){
    
    const allBrands = await Brand.collection().fetch();
    return allBrands;
}

async function getBrandByID(brandId){
    
    const product = await Brand.where({
        'id':parseInt(brandId)
    }).fetch({
        require:true
    })

    return product;

}


module.exports = { getAllBrands, getBrandByID }