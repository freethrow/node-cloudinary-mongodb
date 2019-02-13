module.exports = {
    ensureAuthenticated: function(req, res, next) {
      console.log("Ensure Auth called on ");
      console.log(req.url);
      if (req.isAuthenticated()) {
        res.locals.user = req.session.user;
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/users/login');
    }
  };