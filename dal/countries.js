const { Country } = require('../models');

async function getAllCountries(){
    
    const allCountries = await Country.collection().fetch();
    return allCountries;
}

async function getCountryByID(countryId){
    
    const country = await Country.where({
        'id':parseInt(countryId)
    }).fetch({
        require:true
    })

    return country;

}


module.exports = { getAllCountries, getCountryByID }