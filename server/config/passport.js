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
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
    (req, username, password, cb) => {
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          cb(err, null);
        } else {
          const data = await db.createUser(req, username, hash);
          if (data === 'already exists') {
            cb(data, null);
          } else {
            let userInfo = await db.checkCredentials(username);
            cb(null, userInfo);
          }
        }
      });
    }
  ));
}
