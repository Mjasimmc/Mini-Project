const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:[String],
    stock:{
        type:Number,
        required:true
    },category:{
        type:String,
        ref:'category',
        
    },
    delete:{
        type:Number,
        default:0
    },
    offer:{
        status:{
            type:Boolean,
            default:false
        },
        amount:{
            type:Number,
            default:0
        }
    },
    offerprice:{
        type:Number,
        default:0
    }
    
})
module.exports = mongoose.model('product',productSchema);