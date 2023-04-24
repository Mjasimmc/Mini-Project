const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' })
const mongoConnect = () => {
    mongoose.connect(process.env.URL)
        .then(() => console.log("db connected"))
        .catch(() => console.log("db not connected"))
}
module.exports = mongoConnect ; 