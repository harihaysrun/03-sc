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
  return db.createTable('orders',{
    'id': {
      'type': 'int',
      'primaryKey':true,
      'autoIncrement':true,
      'unsigned': true
    },
    'user_id':{
      type:'int',
      notNull:true,
      unsigned: true,
      foreignKey: {
        'name':'order_user_fk',
        'table':'users',
        'mapping':'id',
        'rules':{
          'onDelete':'cascade',
          'onUpdate':'restrict'
        }
      }
    },
    'date': {
      'type': 'string',
      'length':1000
    },
    'items': {
      'type': 'string',
      'length':1000
    },
    'amount': {
      'type': 'int',
      'unsigned': true
    },
    'payment_status': {
      'type': 'string',
      'length':1000
    },

  })
};

exports.down = function(db) {
  return db.dropTable("orders");
};

exports._meta = {
  "version": 1
};
