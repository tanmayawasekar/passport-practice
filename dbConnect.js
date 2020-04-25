//Bring in the mongoose module
const mongoose = require('mongoose');

// const dbURI = "mongodb://localhost:27017/kitch-display-ordering";
const dbURI = "mongodb://localhost:27017/passport-app";

//console to check what is the dbURI refers to
console.log("Database URL is =>>", dbURI);

mongoose.Promise = Promise;

//Open the mongoose connection to the database
mongoose.connect(dbURI, {
  'config': {
    'autoIndex': false
  },
  useNewUrlParser: true
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

process.on('SIGINT', function () {
  db.close(function () {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

//Exported the database connection to be imported at the server
exports.default = db;