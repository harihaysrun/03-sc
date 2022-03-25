const { User, Role, Employee } = require('../models');

async function getAllUsers(){
    
    const allUsers = await User.collection().fetch({
                        'withRelated': ['role']
                    });
    return allUsers;
}

async function getAllRoles(){

    const allRoles = await Role.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allRoles;

}

async function getAllEmployees(){
    
    const allUsers = await Employee.collection().fetch({
                        'withRelated': ['role']
                    });
    return allUsers;
}

module.exports = { getAllUsers, getAllRoles, getAllEmployees };