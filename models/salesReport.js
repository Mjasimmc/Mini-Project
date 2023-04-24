const mongoose = require('mongoose');
const salesSchema = mongoose.Schema({
    totalPice:{
        type:Number,
        default:true
    }
})

module.exports = mongoose.model("sales",salesSchema)