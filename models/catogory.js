const mongoose = require('mongoose')

const categoryschema = mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    products:{
        type:Number,
        default:0
    }
    ,
    delete:{
        type:Number,
        default:0
    }
    
})
module.exports = mongoose.model('category',categoryschema);