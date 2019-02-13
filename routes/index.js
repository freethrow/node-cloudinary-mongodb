const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const Picture = require('../models/Picture');

router.get('/with', (req, res) =>{

  Picture.find({})
      .then(pictures => {
          res.render('frontPage', {
              layout: 'frontLayout',
              pictures: pictures
            })            
      })

});

// Welcome Page
router.get('/', (req, res) =>
  res.render('frontPage', {layout: 'frontLayout'})
);

// Welcome Page
router.get('/english', (req, res) =>
  res.render('frontPageEnglish', {layout: 'frontLayout'})
);

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

module.exports = router;