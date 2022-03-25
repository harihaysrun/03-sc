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


    req.flash("success_messages", `You have removed ${user.username}`);
    res.redirect('/users');
    
});

router.get('/register', checkIfAuthenticatedAdmin, async function(req,res){

    const allRoles = await userDataLayer.getAllRoles();
    // allRoles.unshift([0, "N/A"]);

    const registerForm = createRegistrationForm(allRoles);
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })

})

router.post('/register', function(req,res) {
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        success: async function(form){
            const employee = new Employee({
                'role_id': form.data.role_id,
                'username': form.data.username,
                'email': form.data.email,
                'first_name': form.data.first_name,
                'last_name': form.data.last_name,
                'password': getHashedPassword(form.data.password),
            });
            await employee.save();
            req.flash("success_messages", "New employee has been added successfully!");
            res.redirect('/')
        },
        'error': function(form) {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/employees', checkIfAuthenticatedAdmin, async function(req,res){

    const allEmployees = await userDataLayer.getAllEmployees();

    // console.log(allEmployees)
    res.render('users/employees',{
        'user': allEmployees.toJSON()
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

            let employee = await Employee.where({
                'username': form.data.username
            }).fetch({
               require:false
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
                        role: employee.get('role_id')
                    }

                    req.flash("success_messages", `Welcome, ${employee.get('username')}!`);
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