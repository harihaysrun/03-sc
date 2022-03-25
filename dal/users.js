const { User, Role } = require('../models');

async function getAllUsers(){
    
    const allUsers = await User.collection().where({
                        'role_id': 1
                    }).fetch({
                        'withRelated': ['role']
                    });
    return allUsers;
}

async function getAllRoles(){
    
    // const allRoles = await Role.collection().fetch({
    //                     'withRelated': ['users']
    //                 });
    // return allRoles;

    const allRoles = await Role.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name') ]
    })

    return allRoles;

}

module.exports = { getAllUsers, getAllRoles };