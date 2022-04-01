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
  return db.createTable('replied_enquiries', {
    "id":{
      "type":"int",
      "primaryKey": true,
      "autoIncrement": true,
      "unsigned": true
    },
    'enquiry_id':{
      'type': 'int',
      'unsiged': true
    },
    "name":{
      "type":"string",
      "length":200,
      "notNull":false
    },
    "email":{
      "type":"string",
      "length":200,
      "notNull":false
    },
    "reason":{
      "type":"string",
      "length":500,
      "notNull":false
    },
    "message":{
      "type":"string",
      "length":10000,
      "notNull":false
    }
  });
};

exports.down = function(db) {
  return db.dropTable("replied_enquiries");
};

exports._meta = {
  "version": 1
};
