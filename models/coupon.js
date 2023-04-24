const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },code:{
        type:String,
        required:true
    },
    issued_date:{
        type:Date,
        required:true
    },
    validUpTo:{
        type:Date,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    users:[
        {
            type:String
        }
    ],
    quantity:{
        type:Number,
        required:true
    },
    disable:{
        type:Boolean,
        default:false
    },
    delete:{
        type:Boolean,
        default:false
    }
    
})
module.exports = mongoose.model('coupon',couponSchema);