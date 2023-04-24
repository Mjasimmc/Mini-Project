const userModify = require('../models/user')
const productView = require('../models/product')
const orderPlace = require('../models/orders')
const categorySearch = require('../models/catogory')
const couponModel = require('../models/coupon')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: __dirname + '../config/.env' })
const Razorpay = require('razorpay');
const product = require('../models/product')
const moment = require('moment');
const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.emailaccount,
        pass: process.env.passwordcode
    }
});
function validateEmail(email) {

    const regex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return regex.test(email);
}
const emailCheck = async (req, res, next) => {
    try {
        const email = req.body.email
        const userdata = await userModify.findOne({ email: email })
        if (validateEmail(email) == false) {
            res.json({
                status: true,
                userdata: "Enter Valid email"
            })
        } else if (userdata) {
            res.json({
                status: true,
                userdata: "email already exist"
            })
        } else {
            res.json({
                status: true,
                userdata: false
            })
        }
    } catch (error) {
        console.log(error.message)
    }
}
const sendOTP = async (toMail, otp) => {
    const mailOptions = {
        from: process.env.emailaccount,
        to: toMail,
        subject: 'Test Email',
        text: `Thanks for registering Your Otp is ${otp}`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return false
        } else {
            console.log(otp);
            return true
        }
    });
}
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (err) {
        console.log(err.message)
        res.redirect('/')
    }
}


const loadLanding = async (req, res, next) => {
    try {
        const category = await categorySearch.find({ delete: 0 });
        const products = await productView.find({ delete: 0 }).populate("category")
        res.render('landing', { products, category })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const loadEmailSend = async (req, res, next) => {
    try {
        res.render('EmailToSend')
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const postEmail = async (req, res, next) => {
    try {
        const sender = req.body.email
        req.session.email = sender
        const otpSend = Math.floor((Math.random() * 1000000) + 1)
        // for testing email otp
        req.session.sendOtp = otpSend
        sendOTP(sender, otpSend)
        res.render('otpChecking')
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const verifyOtp = async (req, res, next) => {
    try {
        const otp = req.session.sendOtp
        const userOtp = req.body.post
        if (otp == userOtp) {
            res.redirect('/signUp')
        } else {
            res.render('otpChecking')
        }
    } catch (error) {
        console.log(error.message)
        next(error)

    }
}
const loadSignUp = async (req, res, next) => {
    try {
        const email = req.session.email
        let alertMessage = req.session.signupmessage
        req.session.signupmessage = ""
        res.render('signup', { alertMessage, email })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const loadSignIn = async (req, res, next) => {
    try {

        let alertMessage = req.session.loginmessage
        req.session.loginmessage = ""
        res.render('signin', { alertMessage })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const postSignIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        let userdata = await userModify.findOne({ email: email });

        if (userdata) {
            const pass = await bcrypt.compare(password, userdata.password)
            if (pass) {
                req.session.login = userdata
                res.redirect('/home');
            } else {
                req.session.loginmessage = "incorrect password"
                res.redirect('/login')
            }
        } else {
            req.session.loginmessage = "user not found"
            res.redirect('/login')

        };
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const loadForgotPassword = async (req, res, next) => {
    try {
        res.render('emailForgetpass')
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const postNumberForgetPass = async (req, res, next) => {
    try {
        const email = req.body.email
        req.session.user = await userModify.findOne({ email: email })
        const otpSend = Math.floor((Math.random() * 1000000) + 1)
        req.session.sendOtp = otpSend
        const send = await sendOTP(email, otpSend)
            .then(() => res.render('forgetOtp'))
            .catch(() => res.redirect('/forgetPass'))

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const postOtpPass = async (req, res, next) => {
    try {
        const otp = req.session.sendOtp
        const userOtp = req.body.post
        if (otp == userOtp) {
            res.render('passChange')
        } else {
            // const otpSend = req.session.sendOtp
            // sendOTP(sendMobile, otpSend)
            res.render('forgetOtp')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const changePass = async (req, res, next) => {
    try {
        const pass = await securePassword(req.body.password)
        const userid = req.session.user._id
        const result = await userModify.findOneAndUpdate({ _id: userid }, {
            $set: {
                password: pass
            }
        })
        res.redirect('/login')
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const postSignUp = async (req, res, next) => {
    try {
        const { mobile, name } = req.body
        let email = req.session.email
        let password = await securePassword(req.body.password)
        const userinsert = new userModify({
            name: name,
            email: email,
            mobile: mobile,
            password: password
        })
        const result = await userinsert.save()
        if (result) {
            req.session.login = result
            res.redirect('/home')
        } else {
            req.session.signupmessage = "err occured on saving"
            res.redirect('/register')
        }
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const loadHome = async (req, res, next) => {
    try {
        const user = req.session.login
        const category = await categorySearch.find({ delete: 0 });
        var products = await productView.find({ delete: 0 }).populate("category")
        res.render('home', { products, user, category })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const logout = async (req, res, next) => {
    try {
        req.session.login = false;
        res.redirect('/')
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}



const notLoggedBrowseProduct = async (req, res, next) => {
    try {
        const prid = req.params.id
        const prdetails = await productView.findOne({ _id: prid });
        const category = prdetails.category
        const products = await productView.find({ delete: 0, _id: category }).populate("category")
        res.render('before-pdt-view', { prdetails, products })

    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const loggedBrowseProduct = async (req, res, next) => {
    try {
        const prid = req.params.id
        const user = req.session.login
        const prdetails = await productView.findOne({ _id: prid })
        const category = prdetails.category
        const products = await productView.find({ delete: 0, category: category }).limit(4)
        res.render('after-pdt-views', { prdetails, user, products })

    } catch (err) {
        console.log(err.message)
        next(err);
    }
}



const loadProfile = async (req, res, next) => {
    try {
        const user = req.session.login
        const userdata = req.session.login
        res.render('profile', { userdata, user })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const addAddress = async (req, res, next) => {
    try {
        let alertMessage = req.session.addmessage
        req.session.addmessage = ""
        const user = req.session.login
        res.render('add-address', { user, alertMessage })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}


const editUser = async (req, res, next) => {
    try {
        req.session.cart = false
        const userdata = req.session.login
        const user = req.session.login
        res.render('edit-profile', { user, userdata })
    } catch (err) {
        console.log(err.message)
        next(err);
    }
}
const insertAddress = async (req, res, next) => {
    try {
        const id = req.session.login
        const { house, city, district, state, post } = req.body
        const userdata = req.session.login
        if (userdata.address != [] || userdata.address != null) {
            const datatoinsert = {
                house: house,
                post: post,
                city: city,
                state: state,
                district: district
            }
            await userModify.findOneAndUpdate({ _id: id }, {
                $push: {
                    address: [datatoinsert]
                }
            }, { new: true }).then(() => req.session.addmessage = 'address added succfuly');
        } else {
            const datatoinsert = {
                house,
                post,
                city,
                state,
                district
            }
            const address = userModify.findOneAndUpdate({ _id: id }, {
                $push: {
                    address: [datatoinsert]
                }
            }, { new: true }).then(() => req.session.addmessage = 'address added succfuly');
        }


        res.redirect('/address-list')
    } catch (err) {
        console.log(err.message);
        next(err)
    }
}
const loadAddress = async (req, res, next) => {
    try {
        alertMessage = req.session.addmessage
        req.session.addmessage = ""
        const user = req.session.login
        const userdata = await userModify.findOne({ _id: user })
        res.render('list-address', { userdata, user, alertMessage })
    } catch (err) {
        console.log(err.message)
        next(err)
    }
}
const deleteAddress = async (req, res, next) => {
    try {
        const addr_id = req.params.id
        id = req.session.login._id
        const result = await userModify.findByIdAndUpdate({ _id: id }, {
            $pull: {
                address: { _id: addr_id }
            }
        }).then(() => req.session.addmessage = 'address removed')
        res.redirect('/address-list')

    } catch (err) {
        console.log(err.message)
        next(err)
    }
}
const updateProfile = async (req, res, next) => {
    try {
        const userid = req.session.login._id
        const { name, email, mobile } = req.body
        await userModify.findOneAndUpdate({ _id: userid }, {
            $set: {
                name: name,
                email: email,
                mobile: mobile
            }
        })
        res.redirect(`/profile`)
    } catch (err) {
        console.log(err.message)
        next(err)
    }
}
const viewCart = async (req, res, next) => {
    try {
        req.session.cart = true
        const user = req.session.login
        const cartdata = await userModify.findOne({ _id: user }).populate("cart.product")
        res.render('cart', { user, cartdata })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const addToCart = async (req, res, next) => {
    try {
        const { pdt_id } = req.body
        const id = req.session.login._id
        const productDetails = await productView.findOne({ _id: pdt_id })
        const check = await userModify.findOne({ _id: id, "cart.product": pdt_id })
        if (check == [] || check == null || check == 'undefined') {
            const quantity = 1
            await userModify.findOneAndUpdate({ _id: id }, {
                $push: {
                    cart: {
                        product: pdt_id,
                        quantity: quantity,
                        offer: {
                            status: productDetails.offer.status,
                            price: productDetails.price
                        }
                    }
                }
            }, { upsert: true })
                .then(() => res.json(
                    {
                        status: true,
                        increment: true
                    }))
                .catch(() => console.log('not inserted'))
        } else {
            const num = parseInt(req.body.num)
            if (check.cart[num].quantity + 1 <= productDetails.stock) {
                await userModify.findOneAndUpdate(
                    { _id: id, "cart.product": pdt_id },
                    { $inc: { "cart.$.quantity": 1 } }
                ).then(() => {
                    res.json(
                        {
                            status: true,
                            increment: false,
                            productIncrement: true,
                        })
                })
            } else {
                res.json(
                    {
                        status: false,
                        increment: false,
                    })
            }
        }
    } catch (err) {
        console.log(err.message);
        next(err)
    }
}
const deleteProductCart = async (req, res, next) => {
    try {
        const { pdt_id } = req.body
        const id = req.session.login._id
        await userModify.findOneAndUpdate({ _id: id }, {
            $pull: {
                cart: { product: pdt_id }
            }
        }).then(() => {
            res.json(
                {
                    status: true,
                })
        }).catch((error) => {
            console.log(error)
        })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const removeCart = async (req, res, next) => {
    try {
        const { pdt_id } = req.body
        const id = req.session.login._id
        await userModify.findOneAndUpdate(
            { _id: id, "cart.product": pdt_id },
            { $inc: { "cart.$.quantity": -1 } }
        ).catch((err) => console.log(err))

        await userModify.findOne({ _id: id })

        res.json({ status: true, removecart: true })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}


const viewShopAfter = async (req, res, next) => {
    try {
        
        const user = req.session.login
        const { products } = req.session
        let category = req.session.category
        res.render('shop-after', { products, user, category })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const viewShopBefore = async (req, res, next) => {
    try {
        const { products } = req.session
        let category = req.session.category
        res.render('shop-before', { products, category})
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}


const loadCheckout = async (req, res, next) => {
    try {
        const user = req.session.login
        const users = await userModify.findOne({ _id: user }).populate("cart.product")
        res.render('after-checkout', { user, users })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const postOrder = async (req, res, next) => {
    try {
        let { name, house, post, city, state, district, totalprice, mobile, payment, coupon } = req.body
        const user = req.session.login
        const productsIn = await productView.find({})
        const userdata = await userModify.findOne({ _id: user._id })
        let products = userdata.cart
        if (coupon) {
            await couponModel.findOneAndUpdate({ _id: req.session.couponid }, {
                $push: {
                    users: user._id
                }
            })
        }
        for (let i = 0; i < user.cart.length; i++) {
            for (let j = 0; j < productsIn.length; j++) {
                if (user.cart[i].product == productsIn[j]._id) {

                    const pdtq = productsIn[j].stock - user.cart[i].quantity
                    await productView.findOneAndUpdate({ _id: productsIn[j]._id }, { $set: { stock: pdtq } })
                }
            }
        }
        let currentDateAndTime = moment();
        currentDateAndTime = currentDateAndTime.format('MMMM Do YYYY, h:mm:ss a')
        const newOrder = new orderPlace({
            user: user._id,
            products: products,
            orderdate: currentDateAndTime,
            payement: payment,
            orderstatus: "order initialized",
            orderaddress: {
                name: name,
                mobile: mobile,
                house: house,
                post: post,
                city: city,
                state: state,
                district: district
            },
            totalprice: totalprice / 100
        })
        const result = await newOrder.save()
        req.session.orderplaced = result
        if (result) {
            
            await userModify.findOneAndUpdate({ _id: user._id }, {
                $push: {
                    userorders: {
                        orderid: result._id
                    }
                }
            })
            const walletbalance = user.wallet - (totalprice / 100)
            if (payment == "COD") {
                res.json({ payment: payment, orderid: result._id })
            } else if (payment == "WLT") {
                await userModify.findOneAndUpdate({ _id: user._id },
                    {
                        $set: { "wallet": walletbalance }
                    })
                await orderPlace.findOneAndUpdate({ _id: result._id }, {
                    $set: {
                        paymentstatus: "Completed"
                    }
                })
                res.json({ payment: payment, orderid: result._id })
            } else {

                const options = {
                    amount: totalprice, // amount in paise
                    currency: "INR",
                    receipt: result._id,
                    payment_capture: 1,
                };
                const orderNo = result._id
                razorpay.orders.create(options, function (err, order) {
                    if (err) {
                        res.json({ status: false })
                    } else {
                        res.json({order,orderNo})
                    }
                });
            }
        } else {
            res.json({ status: false })
        }

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

const conformation = async (req, res, next) => {
    try {
        let  user = req.session.login
        const orderid = req.session.orderplaced._id
        await userModify.findOneAndUpdate({ _id: user._id }, {
            $unset: { cart: 1 }
        })
        user.cart = []
        await orderPlace.findOneAndUpdate({ _id: orderid }, {
            $push: {
                orderstatus: "order recieved"
            }
        })
        
        const orderDetails = await orderPlace.findOne({ _id: orderid }).populate("products.product")
        res.render("order-placed", { orderDetails, user })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const verifPayment = async (req, res, next) => {
    try {
        const { razorpay_payment_id, razorpay_signature } = req.body
        const order_id = req.session.orderid
        const secret = process.env.key_secret
        const message = order_id + '|' + razorpay_payment_id;
        const generated_signature = crypto.createHmac('sha256', secret)
            .update(message)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            const orderid = req.session.orderplaced._id
            await orderPlace.findOneAndUpdate({ _id: orderid }, {
                $set: {
                    paymentstatus: "Completed"
                }
            })
            res.json({
                payment: true,
                orderid: req.session.orderid
            })
        } else {
            res.json({
                payment: true,
                orderid: req.session.orderid
            })
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const listOrders = async (req, res, next) => {
    try {
        const user = req.session.login
        const userOrders = await orderPlace.find({ user: user._id })
        res.render('order-list', { user, userOrders })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const viewWishList = async (req, res, next) => {
    try {
        const id = req.session.login._id
        const user = await userModify.findOne({ _id: id }).populate("wishlist.product")
        res.render("wishlist", { user })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const addToWishList = async (req, res, next) => {
    try {
        const { pdt_id } = req.body
        const id = req.session.login._id
        const check = await userModify.findOne({ _id: id, "wishlist.product": pdt_id })
        if (check == [] || check == null) {
            await userModify.findOneAndUpdate({ _id: id }, {
                $push: { wishlist: { product: pdt_id } }
            }, { upsert: true }).then(() => res.json({ status: true, increment: true }))
                .catch(() => console.log('not inserted'));
        } else { res.json({ status: true, increment: false }) }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const removeWishList = async (req, res, next) => {
    try {
        const { pdt_id } = req.body
        const id = req.session.login._id
        await userModify.findOneAndUpdate({ _id: id }, {
            $pull: { wishlist: { product: pdt_id } }
        }, { upsert: true }).then(() => res.json({ status: true }))
            .catch(() => res.json({ status: false }));

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const checkCoupon = async (req, res, next) => {
    try {
        const { coupon } = req.body
        const id = req.session.login._id
        const date = new Date()
        const couponDetails = await couponModel.findOne({ code: coupon, disable: false, delete: false })
        let couponAllow = true;
        if (couponDetails) {
            if (couponDetails.users.length > 0) {
                for (let i = 0; i < couponDetails.users.length; i++) {
                    req.session.couponid = couponDetails._id
                    if (couponDetails.users[i] == id) {
                        couponAllow = false
                        break;
                    }
                }
                if (couponAllow) {
                    if (date < couponDetails.validUpTo && couponDetails.quantity > 0) {
                        res.json({
                            status: true,
                            amount: couponDetails.amount,
                            couponid: true
                        })
                    } else { res.json({ status: false, amount: false, message: "Coupon Expired" }) }
                } else { res.json({ status: false, amount: false, message: "coupon already Used" }) }
            } else {
                if (date < couponDetails.validUpTo && couponDetails.quantity > 0) {
                    req.session.couponid = couponDetails._id
                    res.json({
                        status: true,
                        amount: couponDetails.amount,
                        couponid: true
                    })
                } else { res.json({ status: false, amount: false, message: "Coupon Exired" }) }
            }
        } else {
            res.json({ status: false, amount: false, message: "Coupon Not Found" })
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const emailValidarion = async (req, res, next) => {
    try {
        const email = req.body.email
        if (validateEmail(email) == false) {
            res.json({
                status: true,
                userdata: "Enter Valid email"
            })
        } else {
            res.json({
                status: true,
                userdata: false
            })
        }
    } catch (error) {
        console.log(error.message)
    }
}
const cancelOrder = async (req, res, next) => {
    try {
        const orderid = req.body.id
        const user = req.session.login._id
        const Order = await orderPlace.findOne({ _id: orderid })
        if (Order.payement == "OP" || Order.payement == "WLT") {
            await userModify.findOneAndUpdate({ _id: user },
                {
                    $inc: { "wallet": Order.totalprice }
                })
        }
        const result = await orderPlace.findOneAndUpdate({ _id: orderid }, {
            $push: {
                orderstatus: "order cancelled"
            }
        })
        if(result){
            res.json({ status: true })
        }else{
            res.json({ status: true })
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const addressOnCheckout = async (req, res, next) => {
    try {
        const id = req.session.login
        const { house, city, district, state, post } = req.body
        const datatoinsert = {
            house: house,
            post: post,
            city: city,
            state: state,
            district: district
        }
        await userModify.findOneAndUpdate({ _id: id }, {
            $push: {
                address: [datatoinsert]
            }
        }, { new: true }).then(() => res.json({ status: true }));
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const walletCheck = async (req, res, next) => {
    try {
        const wallet = req.session.login.wallet
        const amount = req.body.amount
        if (wallet < amount) {
            res.json({ status: false })
        } else {
            res.json({
                status: true,
                wallet: wallet
            })
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const orderDetails = async (req, res, next) => {
    try {
        const user = req.session.login
        const orderId = req.params.id
        const orderDetails = await orderPlace.findOne({ _id: orderId }).populate("products.product")
        res.render("order-details", { user, orderDetails })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const parmentFailed = async (req,res,next)=>{
    try {
        const id = req.params.id
        const result = await orderPlace.findOneAndRemove({_id:id})
        .then(()=>{
            res.render("paymentFailed",{user:req.session.login})
        })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

const paymentChange = async(req,res,next)=>{
    try {
        const user = req.session.login
        const id = req.body.order
        const payment = req.body.payment
        if (payment == 'WLT'){
            const walletbalance = user.wallet - (totalprice / 100)
            await userModify.findOneAndUpdate({ _id: user._id },
                {
                    $set: { "wallet": walletbalance }
                })
            await orderPlace.findOneAndUpdate({ _id: result._id }, {
                $set: {
                    paymentstatus: "Completed"
                }
            })
            res.json({ payment: payment, orderid: result._id })
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}
module.exports = {
    parmentFailed,
    paymentChange,
    orderDetails,
    walletCheck,
    addressOnCheckout,
    cancelOrder,

    emailValidarion,

    checkCoupon,
    removeWishList,
    addToWishList,
    viewWishList,
    listOrders,
    conformation,
    verifPayment,
    changePass,
    postOtpPass,
    postNumberForgetPass,
    loadForgotPassword,
    loadSignUp,
    loadEmailSend,
    postEmail,
    verifyOtp,
    postOrder,
    loadCheckout,
    viewShopAfter,
    viewShopBefore,
    viewCart,
    addToCart,
    removeCart,
    deleteProductCart,
    loadLanding,
    loadSignIn,
    loadProfile,
    loadHome,
    editUser,
    updateProfile,
    insertAddress,
    deleteAddress,
    addAddress,
    loadAddress,
    logout,
    postSignIn,
    postSignUp,
    notLoggedBrowseProduct,
    loggedBrowseProduct,
    emailCheck
}