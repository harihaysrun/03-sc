const express = require("express");
const router = express.Router();

const { Country } = require('../models');
const { bootstrapField, createCountryForm } = require('../forms');

const countryDataLayer = require('../dal/countries');
const { checkIfAuthenticated } = require('../middlewares');

router.get('/', checkIfAuthenticated, async function(req,res){

    const allCountries = await countryDataLayer.getAllCountries();
    
    res.render('countries/index',{
        'country': allCountries.toJSON()
    })

});

router.get('/add', checkIfAuthenticated, async function(req,res){

    const countryForm = createCountryForm();

    res.render('countries/create',{
        'countryForm': countryForm.toHTML(bootstrapField)
    })
})

router.post('/add', checkIfAuthenticated, async function(req,res){
    
    const countryForm = createCountryForm();

    countryForm.handle(req,{
        'success':async function(form){
            const newCountry = new Country();
            newCountry.set('name', form.data.country);
            await newCountry.save();

            req.flash("success_messages", `${newCountry.get('name')} has been added to the list`);

            res.redirect('/countries');
        },
        'error':function(form){
            res.render('countries/create',{
                'countryForm':countryForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:country_id/update', checkIfAuthenticated, async function(req,res){

    const countryId = req.params.country_id;
    const country = await countryDataLayer.getCountryByID(countryId);
    const countryForm = createCountryForm();

    countryForm.fields.country.value = country.get('name');

    res.render('countries/update', {
        'form': countryForm.toHTML(bootstrapField),
        'country': country.toJSON()
    })
    
})

router.post('/:country_id/update', checkIfAuthenticated, async function(req,res){
    const countryId = req.params.country_id;
    const country = await countryDataLayer.getCountryByID(countryId);
    const countryForm = createCountryForm();

    countryForm.handle(req,{
        'success':async function(form){
            country.set('name', form.data.country);
            country.save();

            req.flash("success_messages", `${country.get('name')} has been updated`);

            res.redirect('/countries');
        },
        'error':function(form){
            res.render('countries/update',{
                'form':form.toHTML(bootstrapField),
                'country': country.toJSON()
            })
        }
    })
});

router.get('/:country_id/delete', checkIfAuthenticated, async function(req,res){
    const countryId = req.params.country_id;
    const country = await countryDataLayer.getCountryByID(countryId);
    
    res.render('countries/delete', {
        'country': country.toJSON()
    })
})

router.post('/:country_id/delete', checkIfAuthenticated, async function(req,res){
    const countryId = req.params.country_id;
    const country = await countryDataLayer.getCountryByID(countryId);
    
    await country.destroy();
    req.flash("success_messages", `Country successfully removed`);
    res.redirect('/countries');
})

module.exports = router;