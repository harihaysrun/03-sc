const express = require("express");
const router = express.Router();
const crypto = require('crypto');

const { User, Employee } = require('../models');
const {bootstrapField, createRegistrationForm, createLoginForm } = require('../forms');

const userDataLayer = require('../dal/users');
const { checkIfAuthenticated, checkIfAuthenticatedAdmin } = require('../middlewares');


function getHashedPassword(password){
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}


router.get('/', checkIfAuthenticated, async function(req,res){

    const allUsers = await userDataLayer.getAllUsers();

    console.log(allUsers)
    res.render('users/users',{
        'user': allUsers.toJSON()
    })

})

router.get('/:user_id/delete', checkIfAuthenticated, async function(req,res){

    const userId = req.params.user_id;
    const user = await User.where({
        'id':userId
    }).fetch({
        require:true,
    });

    res.render('users/delete', {
        'user': user.toJSON()
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

router.get('/login', function(req,res){
    const loginForm = createLoginForm();
    res.render('users/login',{
        'form': loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', async function(req, res) {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async function(form) {

            let employee = await Employee.where({
                'username': form.data.username
            }).fetch({
               require:false,
               withRelated: ['role']
            });

            if (!employee) {
                req.flash("error_messages", "Sorry, your account or password is incorrect")
                res.redirect('/users/login');
            } else {
                if (employee.get('password') === getHashedPassword(form.data.password)) {

                    req.session.user = {
                        id: employee.get('id'),
                        username: employee.get('username'),
                        email: employee.get('email'),
                        role: employee.get('role_id'),
                        role_name: employee.related('role').get('name')
                    }

                    req.flash("success_messages", `Welcome, ${employee.get('username')}!`);
                    res.redirect('/dashboard');
                } else {
                    req.flash("error_messages", "Sorry, your account or password is incorrect")
                    res.redirect('/users/login')
                }
            }
        }, 'error': function(form) {
            req.flash("error_messages", "Please try again")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/profile', async function(req, res) {
    if (req.session.user) {
        const user = await User.where({
            'id': req.session.user.id
        }).fetch({
            require: true
        })
        res.render('users/profile',{
            'user': user.toJSON()
        })
    } else {
        req.flash('error_messages', 'Please log in to view this page');
        res.redirect('/users/login');
    }

})

router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success_messages', "You have successfully logged out");
    res.redirect('/users/login');
})

module.exports = router;