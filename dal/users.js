const { User } = require('../models');

async function getAllUsers(){
    
    const allUsers = await User.collection().fetch();
    return allUsers;

}

module.exports = { getAllUsers };