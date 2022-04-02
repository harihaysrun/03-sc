const { Brand } = require('../models');

async function getAllBrands(){
    
    const allBrands = await Brand.collection().query(function(qb){
        qb.orderBy('id', 'DESC')
    }).fetch();
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