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
  return db.createTable('enquiries',{
    'id': {
      'type': 'int',
      'primaryKey':true,
      'autoIncrement':true,
      'unsigned': true
    },
    'name': {
      'type': 'string',
      'length':1000
    },
    'email': {
      'type': 'string',
      'length':1000
    },
    'message': {
      'type': 'string',
      'length':10000
    }

  })
};

exports.down = function(db) {
  return db.dropTable("enquiries");
};

exports._meta = {
  "version": 1
};
