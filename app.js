require("./dbConnect")
const http = require("http")
const express = require("express")
const session = require("express-session")
const MongoStore = require('connect-mongo')(session);
const bodyParser = require("body-parser");
const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy
, FacebookStrategy = require('passport-facebook').Strategy
, GoogleStrategy = require('passport-google-oauth20').Strategy;


require("./models")

const mongoose = require("mongoose")
const app = express()


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user)
});

passport.use(new LocalStrategy(
  function (username, password, done) {
    console.log(username, password)
    mongoose.model("User").findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password != password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.use(new FacebookStrategy({
  clientID: "523097417894216",
  clientSecret: "1478be8d42e0c967d44d966485232d0b",
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  profileFields: ['id', 'displayName',  'birthday', 'friends', 'first_name', 'last_name', 'middle_name', 'gender', 'link', 'email',]
},
function(accessToken, refreshToken, profile, done) {
  // User.findOrCreate(..., function(err, user) {
  //   if (err) { return done(err); }
  //   done(null, user);
  // });
  done(null, {id:2})
}
));

passport.use(new GoogleStrategy({
  clientID: "536960197406-hm9jsjrcuhrrmu2q9n9p23k0tg774e1s.apps.googleusercontent.com",
  clientSecret: "9UNkD2MB9zSjHtAu0dWwZRn9",
  callbackURL: "http://me.mydomain.com:3000/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
    try {
      let raw_object = profile._raw.toString()
      raw_object = JSON.parse(raw_object)
      mongoose.model("User").findOne({
        email: raw_object.email,
        oauth_unique_id: raw_object.sub
      }).then(user => {
        if(user) {
          done(null, user)
        }
        else {
          user = new mongoose.model("User")({
            email : raw_object.email,
            oauth_unique_id : raw_object.sub,
            name : raw_object.name,
            picture : raw_object.picture,
            oauth_raw_object : raw_object,
          }).save()
          .then(user => {
            done(null, user)
          })
          .catch(done)
        }
      })
    } catch (error) {
      done(error)
    }
  }
));


app.use(session({
  secret: "cats", saveUninitialized: false, resave: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  cookie: {
    httpOnly: true,
    maxAge: 60000
  }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook',{ scope : ['user_friends', 'public_profile', 'user_friends', 'manage_pages',  'email'] , successRedirect: '/',
                                      failureRedirect: '/login' }));

app.get('/auth/google', passport.authenticate('google', { scope: ['openid' ,'profile' ,'email'] }));


app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.post('/login',
  passport.authenticate('local'), function(req, res) {
    if(req.user) {
      req.session.user = req.user
      res.redirect("/")
    }
    else {
      res.redirect("/login")
    }
  }
);


app.get("/login", function (req, res) {
  res.send("/login page")
})

// app.post("/changepassword", function(req, res) {
//   req.session
    
// });

app.use(function (req, res, next) {
  if (req.user) {
    user = mongoose.model("User").findOne({
      _id: req.user._id,
      // password: req.user.password
    })
    .then(user => {
      if(user){
        req.session.user = user
        req.user = user
        next()
      } 
      else {
        req.logout()
        req.session.destroy()
        res.redirect("/login")
      }
    })
  }
  else {
    res.redirect("/login")
  }
})
app.get("/", function (req, res) {
  res.send(`welcome to dashboard page ${req.user.email}`)
})

app.get('/logout', function (req, res) {
  req.logout();
  req.session.destroy()
  res.redirect('/login');
});


http.createServer(app).listen(3000)