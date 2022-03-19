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
  return db.createTable('products_skin_types',{
    'id': {
      'type':'int',
      'unsigned': true,
      'autoIncrement': true,
      'primaryKey': true
    },
    'product_id': {
      'type': 'int',
      'unsigned': true,
      'notNull': true,
      'foreignKey':{
        'name':'products_skin_types_product_fk',
        'table':'products',
        'mapping':'id',
        'rules':{
          'onDelete':'cascade',
          'onUpdate':'restrict'
        }    
      }
    },
    'skin_type_id':{
      'type':'int',
      'unsigned':true,
      'notNull':true,
      'foreignKey':{
        'name':'products_skin_types_skin_type_fk',
        'table':'skin_types',
        'mapping':'id',
        'rules':{
          'onDelete':'cascade',
          'onUpdate':'restrict'
        }
      }
    } 
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
