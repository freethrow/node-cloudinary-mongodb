const express = require('express');

const path = require('path');
const multer = require('multer');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const Picture = require('../models/Picture');

const upload_width = 800;
const upload_height = 600;


/// Multer + Cloudinary

// Set The Storage Engine
const storage = multer.diskStorage({
  //destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 5*1024*1024},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
};

/////

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dyv0ua6g9', 
  api_key: '398967111164127', 
  api_secret: '_eguhPdcW933fZduiMlOUweb_L4'
});
//////




router.use((req, res, next) => {
   if (req.user) {
       next();
   } else {
      req.flash('success_msg','You have to login to see the pictures');
      res.redirect('/users/login');
   }
});

// All pictures
router.get('/', (req, res) =>{

    Picture.find({})
        .then(pictures => {
            res.render('pictures', {
                user: req.user,
                pictures: pictures
              })            
        })
  
});


// Add picture
router.get('/new', (req, res) =>
  res.render('addPicture', {
    user: req.user
  })
);



// single picture view
// Add picture
router.get('/show/:id', (req, res) =>{

  Picture.findById(req.params.id)
  .then(picture=>{
    res.render('showPicture', {
      picture:picture,
      user: req.user
      
      });
  });
 });


 router.post('/delete/:id', (req, res) =>{

   console.log(req.body);

   Picture.findById(req.params.id)
   .then(picture=>{
     pub_id = picture.public_id;
     if ((req.body.title == picture.title) && (req.body.remove)){
        Picture.findByIdAndRemove(req.params.id)
        .then(()=>{

          // cloudinary file delete
          public_id =
          cloudinary.v2.uploader.destroy(pub_id, function(result) {
             console.log("Destroying on uploader");
             console.log(result);
              req.flash('success_msg','Picture deleted from Cloudinary');
               });
          req.flash('success_msg','Picture deleted succesfully');
          res.redirect('/dashboard')
        }
        
        )
     }
     else {
       req.flash('success_msg','Picture could not be deleted');
       req.flash('success_msg','You have to check the box AND type the name of the image');
       res.redirect('/dashboard');
     }
   })
  
 });

// add picture to cloudinary


 // register page post


 router.post('/new', (req, res) => {

     

  upload(req, res, (err) => {
    if(err){
      console.log(err);
      res.redirect('/');
    } else {
      if(req.file == undefined){
        console.log('NO FILES');
        res.redirect('/dashboard');
      } else {
        console.log(req.file.path);

        cloudinary.v2.uploader.upload(req.file.path, { width: upload_width, height: upload_height, crop: "fit" },
        function(err, result) {
      if(err) {
        console.log(err);
       
         } else {
             console.log(result);
             console.log(result.url);

             /// Create new image in MongoDB!!
            
            let front = false;
            if (req.body.front != undefined)
            {front = true};

            const newPicture = new Picture({
                title: req.body.title,
                url: result.url,
                public_id:result.public_id,
                front:front,
                user: req.user.id });

            newPicture.save()
            .then(pic => {
                         req.flash('success_msg','Picture inserted succesfully');
                         req.flash(pic.url);
                         })
            .catch(err =>console.log(err));
                    
             ////
         }

        });

        res.redirect('/dashboard');
      }
    }
  });
});

         

module.exports = router;