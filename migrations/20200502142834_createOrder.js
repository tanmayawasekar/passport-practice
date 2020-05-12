
const knex = require('../dbConnect').knex  
exports.up = function() {

  return knex.schema.createTable('order', function (table) {
    table.increments()
    table.string('user_uuid')
    table.string('item_name')
    table.integer('item_quantity')
    table.timestamps()
    table.uuid('order_uuid')
    table.unique('order_uuid')
  }).createTable('order_api_logs', function(table) {
    table.increments()
    table.integer('order_id').unsigned()
    table.foreign('order_id').references('order.id')
    table.string('response')
    table.string('request')
    table.date('created_at')
    table.enum('log_type', ['order', 'payment'])
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('order_api_logs').dropTableIfExists('order')
};
