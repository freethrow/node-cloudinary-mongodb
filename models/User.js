const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    isAdmin:{
        type: Boolean,
        default: false
    },

});


// Virtual for author's URL
UserSchema
.virtual('url')
.get(function () {
  return '/users/author/' + this._id;
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
