const { User } = require('../models');

async function getAllUsers(){
    
    const allUsers = await User.collection().fetch({
                        'withRelated': ['role']
                    });
    return allUsers;

}

module.exports = { getAllUsers };