const express = require("express");
const router = express.Router();

const enquiryDataLayer = require('../../dal/enquiries');
const { Enquiry } = require('../../models');

router.get('/', async function(req,res){

    const allReasons = await enquiryDataLayer.getAllReasons();

    res.json({
        'reasons': allReasons,
    })

})

router.post('/', async function(req,res){

    const enquiry = new Enquiry({
        'name':req.body.name,
        'email': req.body.email,
        'reason_id': req.body.reason_id,
        'message':req.body.message
    })

    await enquiry.save();

    res.sendStatus(200)

})


module.exports = router;
