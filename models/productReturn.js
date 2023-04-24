const mongoose = require('mongoose');
const returnProduct = mongoose.Schema({
    user:{
        type:String,
        required:true
    },
    order:{
        type:String,
        required:true
    },
    prodcutId:{
        quantity:{
            type:Number,
            required:true
        },
        product:{
            type:String,
            required:true
        }
    }
})


module.exports = mongoose.model('returnProduct',returnProduct)