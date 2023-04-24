const multer = require('multer')
const path = require('path')

module.exports = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/ProductImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        
        cb(null, name)
    }
})
