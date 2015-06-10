var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//var jwt = require('./services/jwt.js');
var jwt = require('jwt-simple');

var authentication = require('./services/authentication/authentication.js');
var User = require('./models/user.js');
var Recipe = require('./models/recipe.js')

var app = express();

app.use(bodyparser.json());
app.use(passport.initialize());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

app.use(function (request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Method', 'GET,PUT,POST,DELETE');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
});

var strategyOptions = {
    usernameField: 'email'
};

var loginStrategy = new LocalStrategy(strategyOptions, function (email, password, done) {

    var searchUser = {
        email: email
    };

    User.findOne(searchUser, function (err, user) {
        if (err) return done(err);

        if (!user) return done(null, false, {
            message: 'Wrong email/password!'
        });

        user.comparePasswords(password, function (err, isMatch) {
            if (err) return done(err);

            if (!isMatch)return done(null, false, {
                message: 'Wrong email/password!'
            });

            return done(null, user);
        });
    })
});

var registerStrategy = new LocalStrategy(strategyOptions, function (email, password, done) {

    var searchUser = {
        email: email
    };

    User.findOne(searchUser, function (err, user) {
        if (err) return done(err);

        if (user) return done(null, false, {
            message: 'Email already exists!'
        });

        var newUser = new User({
            email: email,
            password: password
        });

        newUser.save(function (err) {
            done(null, newUser);
        })
    })
});

passport.use('local-register', registerStrategy);
passport.use('local-login', loginStrategy);

app.get('/healthcheck', function (req, res) {
    return res.send('This is the class app dover health check!');
});

app.post('/register', passport.authenticate('local-register'), function (req, res) {
    createSendToken(req.user, res);
});

app.post('/login', passport.authenticate('local-login'), function (req, res) {
    createSendToken(req.user, res);
});

function createSendToken(user, res) {
    var payload = {
        sub: user.id
    };

    var token = jwt.encode(payload, "shh..");

    res.status(200).send({
        user: user.toJSON(),
        token: token
    });

}

app.post('/postrecipe', function (req, res) {
    var newRecipe = new Recipe({
        name: req.body.name,
        ingredients: req.body.ingredients
    });


    newRecipe.save(function(err){
        if (err) throw err;
    });

    return res.send('success');
});

app.get('/getrecipes', function (req, res) {

    //authentication.authorization(req,res);
    //
    //var token = req.headers.authorization.split(' ')[1];
    //var payload = jwt.decode(token, "shh..");
    //
    //if (!payload.sub) {
    //    res.status(401).send({
    //        message: 'Authentication failed'
    //    });
    //}

    Recipe.find({}, function(err, resRecipes){
        if (err) throw err;

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(resRecipes));
    });

});

var jobs = [
    'Cook', 'SuperHero', 'Janitor', 'President'
];

app.get('/jobs', function (req, res) {

    if (!req.headers.authorization) {
        return res.status(401).send({
            message: 'You are not authorized!'
        });
    }

    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token, "shh..");

    if (!payload.sub) {
        res.status(401).send({
            message: 'Authentication failed'
        });
    }


    res.json(jobs);
});

//mongoose.connect("mongodb://localhost/psjwt");

var options = {
    server: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}},
    replset: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}}
};

var mongodbUri = 'mongodb://jrlats:food01@ds059661.mongolab.com:59661/recipedb';
var mongooseUri = uriUtil.formatMongoose(mongodbUri);
mongoose.connect(mongooseUri, options);
//mongoose.connect("mongodb://api.mongolab.com/api/1/databases?apiKey=hzd1WyuWTz7zoQCupJ4_Cdr9jehruNeQ");

//var server = app.listen(3000, function () {
//    console.log('api listening on ', server.address().port);
//});

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function() {
    console.log("Node app is running on port:" + app.get('port'))
});
