const express = require("express");
const router = express.Router(); 
const crypto = require('crypto');

const brandDataLayer = require('../dal/brands');
const productDataLayer = require('../dal/products');
const userDataLayer = require('../dal/users');
const orderDataLayer = require('../dal/orders');

const { User, Employee } = require('../models');
const {bootstrapField, createLoginForm } = require('../forms');


function getHashedPassword(password){
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}


router.get('/', async function(req,res) {
    if(req.session.user){
        res.redirect('/dashboard');
    }
    res.redirect('/login');
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

            let employee = await Employee.where({
                'username': form.data.username
            }).fetch({
               require:false,
               withRelated: ['role']
            });

            if (!employee) {
                req.flash("error_messages", "Sorry, your account or password is incorrect")
                res.redirect('/login');
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
                    res.redirect('/login')
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

router.get('/dashboard', async function(req,res) {

    const allProducts = await productDataLayer.getAllProducts();
    const allUsers = await userDataLayer.getAllUsers();
    const allEmployees = await userDataLayer.getAllEmployees();
    const allOrders = await orderDataLayer.getAllOrders();
    
    
    if(req.session.user && req.session.user.role === 1){
        res.render('landing/admin',{
            'products': allProducts.toJSON(),
            'users': allUsers.toJSON(),
            'employees': allEmployees.toJSON(),
            'orders': allOrders.toJSON().reverse(),
            'admin': true
        })
    } 

    if(req.session.user && req.session.user.role === 2){
        res.render('landing/manager',{
            'products': allProducts.toJSON(),
            'users': allUsers.toJSON(),
            'orders': allOrders.toJSON().reverse()
        })
    } 
})

router.get('/profile', async function(req, res) {
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

router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success_messages', "You have successfully logged out");
    res.redirect('/login');
})

module.exports = router;