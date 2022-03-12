const knex = require('knex')({
    'client': 'mysql',
    'connection':{
        'user':'foo',
        'password': 'bar',
        'database': 'matcha'
    }
});

const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;