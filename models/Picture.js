const mongoose = require("mongoose");

const PictureSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    url:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    front:{
        type:Boolean,
        default:false
    },
    public_id:{
        type:String,
        default:false
    },
    user:{
        type: String,
        required: true
    }

});

const Picture = mongoose.model('Picture', PictureSchema);

module.exports = Picture;
