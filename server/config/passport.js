let LocalStrategy = require('passport-local').Strategy;
let db = require('../../database-pg');
let bcrypt = require('bcrypt');
let bodyParser = require('body-parser');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) { // creating sessions
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });


  // LOCAL LOGIN STRATEGY
  passport.use('local-login', new LocalStrategy( // strategy = type of logging in (e.g. fb)
    async (username, password, cb) => {
      const userInfo = await db.checkCredentials(username);

      if (userInfo.length) {
        const user = userInfo[0];
        console.log('user', user);
        bcrypt.compare(password, user.password, (err, res) => {
          if (err) {
            cb(err, null);
          } else {
            cb(null, user);
          }
        })
      } else {
        cb(null, false);
      }
    }
  ));

  //LOCAL SIGNUP Strategy
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function(req, email, password, cb) {
      let body = req.body;
      let firstname = body.firstname;
      let lastname = body.lastname;
      let bio = body.bio;
      let role = body.role;
      let location = body.zipcode;
      let race = body.race;
      let photo = body.photo;
      db.getUserByEmail(email, function(err, user) {
        if (err) {
          return cb(err, null);
        }
        if (user.length > 0) {
          console.log('User exists!')
          return cb(err, null);
        } else {
          db.addUser(email, password, firstname, lastname, bio, role, location, race, photo, function(err, results) { // add whatever else needs to be added here, like bio
            if (err) {
              return cb(err, null);
            }
            return cb(null, results); // put something here to verify signup successful
          });
        }
      })
    }
  ));
}
