const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");

const flash = require("connect-flash");

const session = require("express-session");
const passport = require("passport");

var moment = require('moment');
moment().format();


const app = express();

// passport config
require('./config/passport')(passport);


// DB config
const db = require('./config/keys').MongoURI;

// connect to mongo
mongoose.connect(db, {useNewUrlParser:true}).
    then(() =>{ console.log('MongoDB connected');}).
    catch((err) => {
        console.log(err);
    });


// express layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');

// bodyparser
app.use(express.urlencoded({extended:false}));

// express session

app.use(session({
    secret:"nekatajna",
    resave: true,
    saveUninitialized: true
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// global vars
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next()
});


// Public Folder
app.use(express.static('./public'));

// routes
app.use('/', require('./routes/index'));

app.use('/users', require('./routes/user'));
app.use('/pictures', require('./routes/picture'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));

