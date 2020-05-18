// Important Links ------->>>>>>>-->>
// Important Links ------->>>>>>>
// Important Links ------->>>>>>>
// Important Links ------->>>>>>>
// https://github.com/mike-marcacci/node-redlock
// https://github.com/Ideonella-sakaiensis/lib_mysqludf_redis
const { knex, redisClient } = require("./dbConnect")
const http = require("http")
const express = require("express")
const session = require("express-session")
const MongoStore = require('connect-mongo')(session);
const bodyParser = require("body-parser");
const passport = require("passport")
const logger = require('morgan')
const path = require('path')
const LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , GoogleStrategy = require('passport-google-oauth20').Strategy;
var hbs = require('express-handlebars');
const key_id = 'rzp_test_GPW4CVjL9J4aIh'
const key_secret = 'b2yGv5i2E9ngrhhF9McKBusT';
const Razorpay = require('razorpay')

// MYSQL REDIS PLUGIN// https://github.com/Ideonella-sakaiensis/lib_mysqludf_redis
// Write Through Redis Strategy. https://medium.com/wultra-blog/achieving-high-performance-with-postgresql-and-redis-deddb7012b16
function disableHTTPCaching(req, res, next) {
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
  response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
  response.setHeader("Expires", "0"); // Proxies.
  next()
}

const razorPay = new Razorpay({
  key_id,
  key_secret,
});

require("./models")

const mongoose = require("mongoose")
const app = express()
app.set('trust proxy', 1);

// view engine setup
app.engine('hbs', hbs({
  extname: 'hbs'
}));
app.set('view engine', 'hbs');
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');
// app.engine( 'hbs', hbs( {
//   extname: 'hbs',
//   defaultView: 'default',
//   layoutsDir: __dirname + '/views/pages/',
//   partialsDir: __dirname + '/views/partials/'
// }));
app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user)
});

// passport.use(new FacebookStrategy({
//   clientID: "523097417894216",
//   clientSecret: "1478be8d42e0c967d44d966485232d0b",
//   callbackURL: "http://localhost:3000/auth/facebook/callback",
//   profileFields: ['id', 'displayName',  'birthday', 'friends', 'first_name', 'last_name', 'middle_name', 'gender', 'link', 'email',]
// },
// function(accessToken, refreshToken, profile, done) {
//   // User.findOrCreate(..., function(err, user) {
//   //   if (err) { return done(err); }
//   //   done(null, user);
//   // });
//   done(null, {id:2})
// }
// ));

passport.use(new LocalStrategy(
  {passReqToCallback: true},
  (req, username, password, done) => {
    if (req.isRegisteredNow) {
      done(null, req.registerdUser)
    }
    else {
      console.log(username, password)
      mongoose.model("User").findOne({ username: username }, function (err, user) {
        if (err) {
          console.log("err", err)
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (user.password != password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  }
))

passport.use(new GoogleStrategy({
  clientID: "536960197406-hm9jsjrcuhrrmu2q9n9p23k0tg774e1s.apps.googleusercontent.com",
  clientSecret: "9UNkD2MB9zSjHtAu0dWwZRn9",
  callbackURL: "http://me.mydomain.com:3000/auth/google/callback"
},
  function (accessToken, refreshToken, profile, done) {
    try {
      let raw_object = profile._raw.toString()
      raw_object = JSON.parse(raw_object)
      mongoose.model("User").findOne({
        email: raw_object.email,
        oauth_unique_id: raw_object.sub
      }).then(user => {
        if (user) {
          done(null, user)
        }
        else {
          user = new mongoose.model("User")({
            email: raw_object.email,
            oauth_unique_id: raw_object.sub,
            name: raw_object.name,
            picture: raw_object.picture,
            oauth_raw_object: raw_object,
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
    maxAge: 6000000
  }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// app.get('/auth/facebook', passport.authenticate('facebook'));

// app.get('/auth/facebook/callback',
//   passport.authenticate('facebook',{ scope : ['user_friends', 'public_profile', 'user_friends', 'manage_pages',  'email'] , successRedirect: '/',
//                                       failureRedirect: '/login' }));

app.get('/auth/google', passport.authenticate('google', { scope: ['openid', 'profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/')
  }
);

app.post('/register',
  function (req, res, next) {
    mongoose.model("User").findOne({ username: req.body.username }, function (err, user) {
      if (err || user) {
        return res.redirect('/login')
      }
      else {
        user = new mongoose.model("User")({
          email: req.body.email,
          name: req.body.name,
          password: req.body.password,
          username: req.body.username
        }).save()
          .then(user => {
            req.isRegisteredNow = true
            req.registerdUser = user
            next()
          })
          .catch(
            error => {
              console.log("error", error);
              res.redirect('/login')
            }
          )
      }
    })
  },
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/')
  }
);


// function getLoginPageLock(req, res, next) {
//   var resource = 'locks:account:322452';

//   // the maximum amount of time you want the resource locked in milliseconds,
//   // keeping in mind that you can extend the lock up until
//   // the point when it expires
//   var ttl = 900;

//   redlock.lock(resource, ttl).then(function (lock) {

//     // ...do something here...
//     req.redLock = lock
//     // unlock your resource when you are done
//     if (true) {
//       setTimeout(function () {
//         lock.unlock()
//         .catch(function (err) {
//           // we weren't able to reach redis; your lock will eventually
//           // expire, but you probably want to log this error
//           console.error(err);
//         });  
//       }, 1500)

//     }
//     next()
//   })
//     .catch(error => {
//       console.log("sss---->", error)
//       res.render('login', {
//         resourceLock: true
//       })
//     });
// }

app.get("/login", function (req, res) {
  // setTimeout(function () {
  res.render('login', { login: true })
  // req.redLock.unlock()
  //   .catch(function (err) {
  //     // we weren't able to reach redis; your lock will eventually
  //     // expire, but you probably want to log this error
  //     console.error(err);
  //     // res.render('login', { template: 'login' , resourceLock: true})
  //   });
  // }, 1000)
})

app.get("/register", function (req, res) {
  // setTimeout(function () {
  res.render('login', { register: true })
  // req.redLock.unlock()
  //   .catch(function (err) {
  //     // we weren't able to reach redis; your lock will eventually
  //     // expire, but you probably want to log this error
  //     console.error(err);
  //     // res.render('login', { template: 'login' , resourceLock: true})
  //   });
  // }, 1000)
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
        if (user) {
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

app.get('/order/all', async function (req, res) {
  allOrder = await knex('order').where({}).join('order_api_logs', 'order_api_logs.order_id', 'order.id')
  res.render('dashboard',  {
    order: true,
    orderList: JSON.stringify(allOrder)
  })
})

app.get("/", function (req, res) {
  res.render('dashboard', {
    user: req.user,
    dashboard: true
  })
})

app.get('/logout', function (req, res) {
  req.logout();
  req.session.destroy()
  res.redirect('/login');
});

app.get('/order', async function (req, res) {
  allOrder = await knex('order').where({}).join('order_api_logs', 'order_api_logs.order_id', 'order.id')
  res.render('order', {
    user: req.user,
    order: true,
    orderList: allOrder.map((e) => e.item_name + '~' + e.item_quantity + '~' + e.order_id)
  })
})

app.get('/order/redis', async function (req, res) {
  const redisKey = 'all_orders_'+req.user._id.toString()
  redisClient.LLEN(redisKey, function (error, response) {
    console.log("redisClient.LLEN",redisKey, error, response, JSON.stringify(response))
    if(response) {
        const range = response -1
        console.log(range, redisKey)
        redisClient.LRANGE(redisKey, 0, range, function (lrangeResponse) {
          console.log("redisClient.LRANGE", error, lrangeResponse, JSON.stringify(lrangeResponse))
          res.render('order', {
            user: req.user,
            redisOrderList: lrangeResponse.map(e => {
              parsedOrder = JSON.parse(e)
              return parsedOrder.item_name + '~' + parsedOrder.item_quantity + '~' + parsedOrder.order_id
            })
          })  
        })
    }
  })
})

app.post('/order', async function (req, res) {
  if (req.body) {
    try {
      const [uuid_result] = await knex.raw("SELECT UUID() as uuid")
      const uuid = uuid_result[0].uuid
      const razorPayRequest = {
        amount: 100, currency: "INR", receipt: uuid, payment_capture: true, notes: "p"
      }
      await knex.transaction(async trx => {
        saved_order_response = await trx('order').insert({
          user_uuid: req.user._id.toString(),
          item_name: req.body.item,
          item_quantity: req.body.itemQ,
          created_at: new Date(),
          updated_at: new Date(),
          order_uuid: uuid
        })
        const razorpay_order = await razorPay.orders.create(razorPayRequest)
        await trx('order_api_logs').insert({
          order_id: saved_order_response[0],
          response: JSON.stringify(razorpay_order),
          request: JSON.stringify(razorPayRequest),
          created_at: new Date(),
          log_type: 'order'
        })
      })
      res.redirect('/checkout?order_id=' + uuid)
    } catch (error) {
      console.error(error)
      res.redirect('/order')
    }
  }
  else {
    req.redirect('/order')
  }
})

app.get('/checkout', async function (req, res) {
  const orderId = req.query.order_id;
  const [order] = await knex('order').where({ order_uuid: orderId }).join('order_api_logs', 'order_api_logs.order_id', 'order.id')

  const rzResponse = JSON.parse(order.response);

  req.razorPay = {
    dataKey: key_id,
    dataAmount: 1000 * order.item_quantity,
    dataOrderId: rzResponse.id,
  }
  res.render('checkout', {
    user: req.user,
    checkout: true,
    razorPay: req.razorPay
  })
})

app.post('/payment/success', async function (req, res) {
  const crypto = require('crypto');
  // await knex('order_api_logs').whereRaw('response LIKE %?%', [req.body.razorpay_order_id])
  // await knex('order_api_logs').insert({
  //   order_id: saved_order_response[0],
  //   response: JSON.stringify(razorpay_order),
  //   request: JSON.stringify(razorPayRequest),
  //   created_at: new Date(),
  //   log_type: 'order'
  // })
  if (req.body.razorpay_signature) {
    const hash = crypto.createHmac('sha256', key_secret)
      .update(`${req.body.razorpay_order_id}|${req.body.razorpay_payment_id}`)
      .digest('hex');
    console.log(hash)
    console.log(req.body)
    if (hash == req.body.razorpay_signature) {
      res.render('dashboard', {
        user: req.user,
        paymentSuccess: true,
        order: true,
      })
    }
    else {
      res.render('dashboard', {
        user: req.user,
        paymentFailure: true,
        order: true
      })
    }
  }
  else {
    res.render('dashboard', {
      user: req.user,
      paymentFailure: true,
      order: true
    })
  }
})


http.createServer(app).listen(3000)