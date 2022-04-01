const { Enquiry, Reason, EnqStatus} = require('../models');

async function getAllEnquiries(){
    
    const allEnquiries = await Enquiry.collection().fetch({
                        'withRelated': ['reason', 'status']
                    });
    return allEnquiries;
}

async function getAllReasons(){

    const allReasons = await Reason.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allReasons
}

async function getEnquiryStatus(){
    
    const status = await EnqStatus.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return status;

}

module.exports = { getAllEnquiries, getAllReasons, getEnquiryStatus };