const express = require("express");
const router = express.Router(); 
const crypto = require('crypto');

const brandDataLayer = require('../dal/brands');
const productDataLayer = require('../dal/products');
const userDataLayer = require('../dal/users');
const orderDataLayer = require('../dal/orders');
const enquiryDataLayer = require('../dal/enquiries');

const { User, Employee } = require('../models');
const {bootstrapField, createRegistrationForm } = require('../forms');
const { checkIfAuthenticated } = require('../middlewares');


function getHashedPassword(password){
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}


router.get('/', checkIfAuthenticated, async function(req, res) {
    if (req.session.user) {
        const user = await Employee.where({
            'id': req.session.user.id
        }).fetch({
            require: true
        })

        if(req.session.user.role === 1){
            res.render('users/profile',{
                'profile': user.toJSON(),
                'admin': true
            })
        } else {
            res.render('users/profile',{
                'profile': user.toJSON()
            })
        }

    } else {
        req.flash('error_messages', 'Please log in to view this page');
        res.redirect('/login');
    }

})


router.get('/update', checkIfAuthenticated, async function(req,res){

    const userId = req.session.user.id;
    const user = await Employee.where({
        'id':userId
    }).fetch({
        require:true,
    });
    
    const allRoles = await userDataLayer.getAllRoles();

    const updateProfileForm = createRegistrationForm(allRoles);

    updateProfileForm.fields.role_id.value = user.get('role_id');
    updateProfileForm.fields.username.value = user.get('username');
    updateProfileForm.fields.email.value = user.get('email');
    updateProfileForm.fields.first_name.value = user.get('first_name');
    updateProfileForm.fields.last_name.value = user.get('last_name');
    updateProfileForm.fields.password.value = user.get('password');
    updateProfileForm.fields.confirm_password.value = user.get('password');


    if(req.session.user.role === 1){
        res.render('users/profile-update', {
            'form': updateProfileForm.toHTML(bootstrapField),
            'admin':true
        })
    } else{
        res.render('users/profile-update', {
            'form': updateProfileForm.toHTML(bootstrapField),
        })
    }
    
});


router.post('/update', checkIfAuthenticated, async function(req,res){

    const userId = req.session.user.id;
    const user = await Employee.where({
        'id':userId
    }).fetch({
        require:true,
    });
    
    const allRoles = await userDataLayer.getAllRoles();

    const registerForm = createRegistrationForm(allRoles);

    registerForm.handle(req,{
        'success':async function(form){
            user.set('role_id', form.data.role_id);
            user.set('username', form.data.username);
            user.set('email', form.data.email);
            user.set('first_name', form.data.first_name);
            user.set('last_name', form.data.last_name);
            user.set('password',  getHashedPassword(form.data.password));
            user.save();

            req.flash("success_messages", "Your profile has been successfully edited");

            res.redirect('/profile');
        },
        'error':function(form){
            res.render('users/profile-update',{
                'form':form.toHTML(bootstrapField),
                'admin':true
            })
        }
    })
    
});


module.exports = router;