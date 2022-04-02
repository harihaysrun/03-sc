const { Enquiry, Reason, RepliedEnquiry } = require('../models');

async function getAllEnquiries(){
    
    const allEnquiries = await Enquiry.collection().fetch({
                        withRelated : ['reason']
                    });
    return allEnquiries;
}

async function getEnquiryById(id){
    
    const enquiry = await Enquiry.where({
                        'id':id
                    }).fetch({
                        require:true,
                        withRelated : ['reason']
                    });
    return enquiry;
}

async function getAllReasons(){

    const allReasons = await Reason.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allReasons
}

async function getAllRepliedEnquiries(){
    
    const allRepliedEnquiries = await RepliedEnquiry.collection().query(function(qb){
                                    qb.orderBy('id', 'DESC')
                                }).fetch();
    return allRepliedEnquiries;
}


module.exports = { getAllEnquiries, getEnquiryById, getAllReasons, getAllRepliedEnquiries };