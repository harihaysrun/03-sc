const express = require("express");
const router = express.Router();
const crypto = require('crypto');

const { User } = require('../models');
const {bootstrapField, createRegistrationForm, createLoginForm } = require('../forms');

const userDataLayer = require('../dal/users');
const { checkIfAuthenticated } = require('../middlewares');


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


    req.flash("success_messages", `You have removed ${user.username}`);
    res.redirect('/users');
    
});


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
                'password': getHashedPassword(form.data.password),
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
                if (user.get('password') === getHashedPassword(form.data.password)) {

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