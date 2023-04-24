
const express = require('express')
const router = express();
const multer = require('multer');
const imagestore = require('../middleware/storage')

const path = require('path')

const storage = imagestore
const upload = multer({storage:storage})

router.set('views', './views/admin')
const adminController = require('../controllers/admin')
const sessionCheck = require('../middleware/adminSession')
const orderDetails = require('../middleware/orderSearch')
const pdffile= require

// admin login
router.get('/',sessionCheck.notLogged,adminController.load_sign_in)
router.post('/login',sessionCheck.notLogged,adminController.post_login)

// logout
router.get('/logout',adminController.logout)

// admin home
router.get('/home',orderDetails,sessionCheck.logged,adminController.load_home)

// profile
router.get('/profile',sessionCheck.logged,adminController.load_profile)


// viewing and user controlling
router.get('/userlist',sessionCheck.logged,adminController.user_list)    
router.post('/block',sessionCheck.logged,adminController.block)
router.post('/unblock',sessionCheck.logged,adminController.un_block)


// products adding
router.get('/addproduct',sessionCheck.logged,adminController.load_insert_product)
router.post('/addproduct',sessionCheck.logged,upload.array('image',10),adminController.insert_product)

// viewing and soft deleting
router.get('/productlist',sessionCheck.logged,adminController.product_list)
router.get('/edit-product/:id',sessionCheck.logged,adminController.load_edit_product)
router.post('/update-product',sessionCheck.logged,adminController.update_product)
router.post('/deleteproduct',sessionCheck.logged,adminController.delete_product)
router.post("/undodelete",sessionCheck.logged,adminController.undo_delete_product)
router.post("/removeimage",sessionCheck.logged,adminController.remove_image)
// category
router.get('/categorylist',sessionCheck.logged,adminController.category_list)
router.get('/category',sessionCheck.logged,adminController.load_category)
router.post('/addcategory',sessionCheck.logged,adminController.insert_category)

router.get('/orderList/:page',sessionCheck.logged,adminController.load_order_list)


router.get('/order/:id',sessionCheck.logged,adminController.view_order)

router.get('/coupon-list',sessionCheck.logged,adminController.list_coupon)
router.get('/addcoupon',sessionCheck.logged,adminController.load_add_coupon )
router.post('/addcoupon',sessionCheck.logged,adminController.post_add_coupon) 
router.post("/updateOrder",sessionCheck.logged,adminController.update_order)

router.post("/addImage",sessionCheck.logged,upload.array('image',10),adminController.add_image)

router.get("/edit-category/:id",sessionCheck.logged,adminController.load_category_edit)
router.post("/updatecategory",sessionCheck.logged,adminController.update_category)

router.post("/delete-category",sessionCheck.logged,adminController.delete_category)
router.post("/undo-Category",sessionCheck.logged,adminController.undo_category)

router.post("/disable-coupon",sessionCheck.logged,adminController.disable_coupon)
router.post("/enable-coupon",sessionCheck.logged,adminController.enable_coupon)

router.get('/coupon/:id',sessionCheck.logged,adminController.load_coupon_edit)
router.post('/updatecoupon',sessionCheck.logged,adminController.update_coupon)
// product offer

router.post('/offer',sessionCheck.logged,adminController.offer_post)
router.get('/deleteofer/:id',sessionCheck.logged,adminController.delete_offer)

router.post('/remove-coupon',sessionCheck.logged,adminController.remove_coupon)
router.post('/pdf-convert',sessionCheck.logged,)

router.get('/export-pdf/:content',sessionCheck.logged,adminController.downloadpdf)
router.get("/pdfcontent/:name",adminController.pdfPage)

module.exports = router;