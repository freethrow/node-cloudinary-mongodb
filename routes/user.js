const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const { check, validationResult } = require('express-validator/check');

const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const User = require('../models/User');

// login page
router.get('/login', (req,res) => {
   res.render('login');
});

// register page
router.get('/register', (req,res) => {
    res.render('register');
 });





 // register page post
router.post('/register', [
   check('email').isLength({ min:4 }),
   ], (req,res) => {
   console.log(req.body);

   const {name, email, password, password2} = req.body;

   let errors =[];

   if (!name || !email || !password || !password2){
      errors.push({msg:'Please fill in all fields!'});
   }

   if (password != password2){
      errors.push({msg:'Passwords dont match!'});
   }

   if (password.length<6){
      errors.push({msg:'Password should be at least 6 chars long!'});
   }


   if(errors.length>0){

      res.render('register',{
         errors,
         name,
         email,
         password,
         password2
      });

   } else {
      // validation passed


      // express validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(422).json({ errors: errors.array() });
            }

      User.findOne({ email: email})
         .then(user => {
            if(user){
               // user exists
               errors.push({msg:'User already exists!'});
               res.render('register',{
                  errors,
                  name,
                  email,
                  password,
                  password2
               });
            } else {

               const newUser = new User({
                  name,
                  email, 
                  password
               });
               console.log(newUser);

               // hash pass

               bcrypt.genSalt(10, (err,salt) => {
                  bcrypt.hash(newUser.password, salt, (err,hash) => {
                     if(err) throw err;
                     newUser.password = hash;
                     // save user
                     newUser.save()
                     .then(user => {
                        req.flash('success_msg','You are registered and can loginnnn...');
                        res.redirect('/users/login');
                     })
                     .catch(err =>{console.log(err);
                     });
                  })
               });

              
            }
         });


   };



});

// Login
router.post('/login', (req, res, next) => {
   passport.authenticate('local', {
     successRedirect: '/dashboard',
     failureRedirect: '/users/login',
     failureFlash: true
   })(req, res, next);
 });
 
 // Logout
 router.get('/logout', (req, res) => {
   req.logout();
   req.flash('success_msg', 'You are logged out');
   res.redirect('/users/login');
 });




// get user
router.get('/author/:userId',ensureAuthenticated, (req, res) =>{
   console.log('get one user');
   console.log(req.url);
   User.findById(req.params.userId)
       .then(oneUser => {

         // find articles
         Article.find({
            user:oneUser._id
         })
         .then(articles => {
            res.render('one_user', {
               user: req.user,
               oneUser: oneUser,
               articles: articles
             })

         })

                       
       })
 
});


module.exports = router;