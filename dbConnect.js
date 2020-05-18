//Bring in the mongoose module
const { promisify } = require("util");
const mongoose = require('mongoose');

// const dbURI = "mongodb://localhost:27017/kitch-display-ordering";
const dbURI = process.env.MONGODB_CONNECTION_STRING ||  "mongodb://localhost:27017/passport-app";

//console to check what is the dbURI refers to
console.log("Mongodb Database URL is =>>", dbURI);

mongoose.Promise = Promise;

//Open the mongoose connection to the database
mongoose.connect(dbURI, {
  'config': {
    'autoIndex': false
  },
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set('useFindAndModify', false);

// Db Connection
const db = mongoose.connection;

db.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);
  process.emit("loadModels")
});

db.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});

db.on('disconnected', function () {
  console.log('Mongoose disconnected');
});

var knex = require('knex')({
  client: 'mysql',
  asyncStackTraces: true,
  connection: {
    host : process.env.MY_SQL_HOST || '127.0.0.1',
    user : 'root',
    password : '7825tanmay',
    database : 'passport-practice',
    insecureAuth: true,
  },
  acquireConnectionTimeout: 1000,
  pool: {
    min: 1, max: 10,
  }
});

process.on('SIGINT', function () {
  knex.destroy(function () {
    console.log('Mysql disconnected');
    db.close(function () {
      console.log('Mongoose disconnected through app termination');
      process.exit(0);
    });
  })
});

process.on('uncaughtException', function (err) {
  console.error(err);
  knex.destroy(function () {
    console.log('Mysql disconnected');
    db.close(function () {
      process.exit(1);
    });
  })
})


// var client1 = require('redis').createClient(6379, 'localhost');
// var Redlock = require('redlock');

// var redlock = new Redlock(
// 	// you should have one client for each independent redis node
// 	// or cluster
// 	[client1,client1,client1],
// 	{
// 		// the expected clock drift; for more details
// 		// see http://redis.io/topics/distlock
// 		driftFactor: 0.01, // time in ms

// 		// the max number of times Redlock will attempt
// 		// to lock a resource before erroring
// 		retryCount:  10,

// 		// the time in ms between attempts
// 		retryDelay:  200, // time in ms

// 		// the max time in ms randomly added to retries
// 		// to improve performance under high contention
// 		// see https://www.awsarchitectureblog.com/2015/03/backoff.html
// 		retryJitter:  200, // time in ms,
    
//   }
// );

knex.on('query-response', function(response, obj, builder) {
  // console.log("------->\n",response,"------->\n", obj,"------->\n", builder);
})

const redis = require("redis");
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "127.0.0.1"
});

//Exported the database connection to be imported at the server
module.exports = {
  knex,
  redisClient
  // redlock
}
