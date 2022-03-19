'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('users',{
    'id': {
      'type': 'int',
      'primaryKey':true,
      'autoIncrement':true,
      'unsigned': true
    },
    'username': {
      'type': 'string',
      'length':100
    },
    'email': {
      'type': 'string',
      'length':100
    },
    'first_name': {
      'type': 'string',
      'length':100
    },
    'last_name': {
      'type': 'string',
      'length':100
    },
    'address_line_1': {
      'type': 'string',
      'length':100
    },
    'address_line_2': {
      'type': 'string',
      'length':100
    },
    'postal_code': {
      'type': 'string',
      'length':20
    },
    'phone_number': {
      'type': 'string',
      'length':20
    },
    'password': {
      'type': 'string',
      'length':80
    }
  })
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
