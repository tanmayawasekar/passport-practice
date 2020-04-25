var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const user = new Schema({
  username: {
    type: String,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    lowercase: true,
    trim: true,
  },
  oauth_unique_id: {
    type: String,
    unique: true,
  },
  oauth_login_type: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true
  },
  oauth_raw_object: Object,
  picture: String
},
  {
    timestamps: true,
  });

process.on('loadModels', function () {
  console.log('Import model ', user);
  mongoose.model('User', user);
  // const m = new mongoose.model("User")({
  //   "username":"asd",
  //   "password":"asd"
  // })
  // m.save()
  // .then(user => {

  // })
});