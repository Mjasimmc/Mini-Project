const express = require('express');
const path = require('path');
const router = express();

router.set('views', path.join(__dirname, '../views/user'))

const userController = require('../controllers/user')
const sessioncheck = require('../middleware/userSession')
const search = require('../middleware/search')
const block = require('../middleware/block')

// welcoming pages

router.post('/userCheck', userController.emailCheck)

router.get('/', sessioncheck.result,search.search, userController.loadLanding)
router.get('/product/:id', search.productGet,search.search, sessioncheck.result, userController.notLoggedBrowseProduct)
router.get('/login', sessioncheck.result, userController.loadSignIn)
router.get('/forgetPass', sessioncheck.result, userController.loadForgotPassword)
router.get('/register', sessioncheck.result, userController.loadEmailSend)
router.get('/signUp', sessioncheck.emailcheck, userController.loadSignUp)
router.get('/lshop', sessioncheck.result,search.search, search.search_result, userController.viewShopBefore)



router.post('/forgetPass', sessioncheck.result, userController.postNumberForgetPass)
router.post('/passchange', sessioncheck.result, userController.postOtpPass)
router.post('/passwordchange', sessioncheck.result, userController.changePass)
router.post('/validateEmail',sessioncheck.result,userController.emailValidarion)
router.post('/register', sessioncheck.result, userController.postEmail)
router.post('/verifyOtp', sessioncheck.result, userController.verifyOtp)


// adding welcomers and resigning
router.post('/registerUser', sessioncheck.result, userController.postSignUp)
router.post('/login', sessioncheck.result, userController.postSignIn)
router.get('/logout', userController.logout)


router.get('/profile', sessioncheck.homeallow, block,search.search, userController.loadProfile)
// user activities
router.get('/home', sessioncheck.homeallow, block,search.search, userController.loadHome)
router.get('/product-home/:id', search.productLook, sessioncheck.homeallow, block,search.search, userController.loggedBrowseProduct)
router.get('/edit-profile/:id', sessioncheck.homeallow, block,search.search, userController.editUser)
router.post('/profile', sessioncheck.homeallow, block, userController.updateProfile)


// address
router.get('/add-address', sessioncheck.homeallow, block,search.search, userController.addAddress)
router.post('/add-address', sessioncheck.homeallow, block, userController.insertAddress)
router.get('/address-list', sessioncheck.homeallow, block,search.search, userController.loadAddress)
router.get('/delete-address/:id', sessioncheck.homeallow, block, userController.deleteAddress)

// cart
router.get('/view-cart', sessioncheck.homeallow, block,search.search, userController.viewCart)
router.post('/add-cart', sessioncheck.homeallow, block, userController.addToCart)
router.post('/remove-cart', sessioncheck.homeallow, block, userController.removeCart)
router.post('/deleteProductcart', sessioncheck.homeallow, block, userController.deleteProductCart)

// shop
router.get('/shop', sessioncheck.homeallow, block,search.search, search.search_result, userController.viewShopAfter)

// checkout
router.get('/checkout', sessioncheck.homeallow,sessioncheck.cartCheck, block, userController.loadCheckout)
router.post('/post-order', sessioncheck.homeallow, block, userController.postOrder)
router.get('/confirmation/:id', sessioncheck.homeallow, block,search.search, userController.conformation)
router.post('/verify-payment', sessioncheck.homeallow, block, userController.verifPayment)
router.post('/paymentChange',sessioncheck.homeallow,block,userController.paymentChange)

// order details on user side
router.get('/list-orders', sessioncheck.homeallow, block,search.search, userController.listOrders)
router.get('/order/:id',sessioncheck.homeallow,block,search.search,userController.orderDetails)

router.get('/view-wishlist', sessioncheck.homeallow, block,search.search, userController.viewWishList)
router.post('/add-wishlist', sessioncheck.homeallow, block, userController.addToWishList)
router.post('/remove-wishlist', sessioncheck.homeallow, block, userController.removeWishList)

router.post('/checkCoupon', sessioncheck.homeallow, block, userController.checkCoupon)
router.post('/cancel-order',sessioncheck.homeallow,block,userController.cancelOrder)
router.post("/checkout-adress",sessioncheck.homeallow,block,userController.addressOnCheckout)
router.get('/payment-failed/:id',userController.parmentFailed)

router.post("/walletCheck",sessioncheck.homeallow,block,userController.walletCheck)
router.post('/search-result',search.search_dynamic_result)
module.exports = router;
