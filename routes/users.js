const express = require("express");
const router = express.Router();

const { User, Employee } = require('../models');
const {bootstrapField, createRegistrationForm, createLoginForm, createCustomerSearchForm } = require('../forms');

const userDataLayer = require('../dal/users');
const { checkIfAuthenticated, checkIfAuthenticatedAdmin } = require('../middlewares');


router.get('/', checkIfAuthenticated, async function(req,res){

    // const allUsers = await userDataLayer.getAllUsers();

    const searchForm = createCustomerSearchForm();

    let query = User.collection();
    searchForm.handle(req,{
        'empty':async function(form){
            let customers = await query.fetch()
            res.render('users/users',{
                'searchForm': searchForm.toHTML(bootstrapField),
                'customers': customers.toJSON()
            })
        },
        'success': async function(form){
            if (form.data.username){
                query.where('username', 'like', '%' + req.query.username + '%')
            }
            if (form.data.email){
                query.where('email', 'like', '%' + req.query.email + '%')
            }

            // search the query
            let customers = await query.fetch();

            res.render('users/users',{
                'searchForm': searchForm.toHTML(bootstrapField),
                'customers': customers.toJSON()
            });
        },
        'error':async function(form){
            let customers = await query.fetch();
            res.render('users/users',{
                'searchForm': searchForm.toHTML(bootstrapField),
                'customers': customers.toJSON()
            })
        }
    })

    // console.log(allUsers)
    // res.render('users/users',{
    //     'user': allUsers.toJSON()
    // })

})

router.get('/:user_id/delete', checkIfAuthenticated, async function(req,res){

    const userId = req.params.user_id;
    const user = await User.where({
        'id':userId
    }).fetch({
        require:true,
    });

    res.render('users/delete', {
        'customer': user.toJSON()
    })
    
});

router.post('/:user_id/delete', checkIfAuthenticated, async function(req,res){

    const userId = req.params.user_id;
    const user = await User.where({
        'id':userId
    }).fetch({
        require:true,
    })
    
    await user.destroy();

    req.flash("success_messages", `User has been successfully removed`);
    res.redirect('/users');
    
});

module.exports = router;