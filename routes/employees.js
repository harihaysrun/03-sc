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

router.get('/register', checkIfAuthenticatedAdmin, async function(req,res){

    const allRoles = await userDataLayer.getAllRoles();
    // allRoles.unshift([0, "N/A"]);

    const registerForm = createRegistrationForm(allRoles);
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField),
        'admin': true
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
            res.redirect('/employees')
        },
        'error': function(form) {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/', checkIfAuthenticatedAdmin, async function(req,res){
    
    const allEmployees = await userDataLayer.getAllEmployees();

    // console.log(allEmployees)
    res.render('users/employees',{
        'employees': allEmployees.toJSON(),
        'admin': true
    })

})


router.get('/:employee_id/delete', checkIfAuthenticatedAdmin, async function(req,res){

    const userId = req.params.employee_id;
    const user = await Employee.where({
        'id':userId
    }).fetch({
        require:true,
    });

    res.render('users/delete-employee', {
        'employee': user.toJSON(),
        'admin': true
    })
    
});

router.post('/:employee_id/delete', checkIfAuthenticatedAdmin, async function(req,res){

    const userId = req.params.employee_id;
    const user = await Employee.where({
        'id':userId
    }).fetch({
        require:true,
    })
    
    await user.destroy();

    req.flash("success_messages", `Employee has been successfully removed`);
    res.redirect('/employees');
    
});


module.exports = router;