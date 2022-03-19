const express = require("express");
const router = express.Router();

const { User } = require('../models');
const {bootstrapField, createRegistrationForm, createLoginForm } = require('../forms');

// const productDataLayer = require('../dal/products')

router.get('/register', function(req,res){

    const registerForm = createRegistrationForm();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', function(req,res) {
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        success: async function(form){
            const user = new User({
                'username': form.data.username,
                'email': form.data.email,
                'first_name': form.data.first_name,
                'last_name': form.data.last_name,
                'address_line_1': form.data.address_line_1,
                'address_line_2': form.data.address_line_2,
                'postal_code': form.data.postal_code,
                'phone_number': form.data.phone_number,
                'password': form.data.password,
            });
            await user.save();
            req.flash("success_messages", "You have signed up successfully!");
            res.redirect('/users/login')
        },
        'error': function(form) {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

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

            let user = await User.where({
                'username': form.data.username
            }).fetch({
               require:false
            });

            if (!user) {
                req.flash("error_messages", "Sorry, your account or password is incorrect")
                res.redirect('/users/login');
            } else {
                if (user.get('password') === form.data.password) {

                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }

                    req.flash("success_messages", `Welcome, ${user.get('username')}!`);
                    res.redirect('/users/profile');
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


module.exports = router;