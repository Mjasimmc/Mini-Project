const UserModify = require('../models/user');
const productModidy = require('../models/product')
const adminDB = require('../models/admin')
const categorydata = require('../models/catogory')
const orderModel = require('../models/orders')
const couponModel = require('../models/coupon')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const path = require('path');
const { parse } = require('path');
const { page } = require('pdfkit');
let downloadingContent
require('dotenv').config({ path: __dirname + '../config/.env' })
const post_login = async (req, res, next) => {
    try {
        const admindata = await adminDB.findOne({})
        const email = admindata.email
        const password = admindata.password
        const useremail = req.body.email
        const userpassword = req.body.password
        if (email == useremail) {
            if (password == userpassword) {
                req.session.adminlogin = true
                res.redirect('/admin/home')
            } else {
                req.session.adminloginmessage = "password incorrect"
                res.redirect('/admin')
            }
        } else {
            req.session.adminloginmessage = "user Not found"
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_sign_in = async (req, res, next) => {
    try {
        alertMessage = req.session.adminloginmessage;
        req.session.adminloginmessage = ""
        res.render('signin', { alertMessage })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_home = async (req, res, next) => {
    try {
        const orders = await orderModel.find({}).sort({ orderdate: -1 }).limit(6).populate("user")
        res.render('home', { orders, todaySales: req.session.todaySales })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const logout = async (req, res, next) => {
    try {
        req.session.adminlogin = false
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const user_list = async (req, res, next) => {
    try {
        const users = await UserModify.find({}).sort({ name: 1 })
        res.render('userlist', { users })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const block = async (req, res, next) => {
    try {
        const userid = req.body.user
        const user = await UserModify.findOneAndUpdate({ _id: userid }, { $set: { blockuser: true } })
        res.json({ status: true })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const un_block = async (req, res, next) => {
    try {
        const userid = req.body.user
        await UserModify.findOneAndUpdate({ _id: userid }, { $set: { blockuser: false } })
        res.json({ status: true })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_insert_product = async (req, res, next) => {
    try {
        const category = await categorydata.find({ delete: 0 })
        req.session.category = category._id;
        res.render('addproduct', { category })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_category = async (req, res, next) => {
    try {
        res.render('addcategory')
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const insert_product = async (req, res, next) => {
    try {
        const product = new productModidy({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            image: req.files.map(file => file.filename),
            category: req.body.fruits,
            stock: req.body.stock
        })
        const categoryid = req.body.fruits;
        await categorydata.findOneAndUpdate({ _id: categoryid }, { $inc: { products: 1 } })
        await product.save()
        res.redirect('/admin/productlist')
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const insert_category = async (req, res, next) => {
    try {
        let category = req.body.name;
        category = category.toLowerCase();
        const product = new categorydata({
            category: category
        })
        const existdata = await categorydata.findOne({ category: category })
        if (existdata != null) {
            req.session.categorymessage = "Your category is already exist"
        } else {
            const categorysave = await product.save()
            if (categorysave) {
                req.session.categorymessage = "category saved sucessfully"
            } else {
                req.session.categorymessage = "error occured on category submition"
            }
        }
        res.redirect('/admin/categorylist')
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const product_list = async (req, res, next) => {
    try {
        let products = await productModidy.find().populate("category")
        res.render('productlist', { products })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const delete_product = async (req, res, next) => {

    try {
        const userid = req.body.id
        await productModidy.findOneAndUpdate({ _id: userid }, { $set: { delete: 1 } })
            .then(() => {
                res.json({
                    status: true,
                })
            }).catch((err) => {
                (err)
                res.json({
                    status: false
                })
            })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const undo_delete_product = async (req, res, next) => {

    try {
        const userid = req.body.id
        await productModidy.findOneAndUpdate({ _id: userid }, { $set: { delete: 0 } })
            .then(() => {
                res.json({
                    status: true,
                })
            }).catch((err) => {
                console.log(err)
                res.json({
                    status: false
                })
            })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_profile = async (req, res, next) => {
    try {
        const admin = await adminDB.findOne({})
        res.render('profile', { admin })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const category_list = async (req, res, next) => {
    try {
        alertMessage = req.session.categorymessage
        req.session.categorymessage = ""
        const category = await categorydata.find({})
        res.render('categorylist', { category })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_edit_product = async (req, res, next) => {
    try {
        const productId = req.params.id
        const product = await productModidy.findOne({ _id: productId })
        const category = await categorydata.find({})
        res.render('productEdit', { product, category })
    } catch (error) {
        console.log(error.messaage)
        next(error)
    }
}
const update_product = async (req, res, next) => {
    try {

        const name = req.body.name
        const price = req.body.price
        const description = req.body.description
        const category = req.body.fruits
        const stock = req.body.stock
        const id = req.body.product
        const productdata = await productModidy.findOneAndUpdate({ _id: id }, {
            $set: {
                name: name,
                price: price,
                description: description,
                category: category,
                stock: stock
            }
        }).then(() => {
            res.redirect('/admin/productlist')
        }).catch((error) => {
            next(error)
        })


    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_order_list = async (req, res, next) => {
    try {
        const page = parseInt(req.params.page)
        const orders = await orderModel.find({}).skip(10 * (page - 1)).limit(10).sort({ orderdate: -1 }).populate("user")
        downloadingContent = orders
        res.render('orderlist', { orders, page })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const view_order = async (req, res, next) => {
    try {
        const OrderId = req.params.id
        const order = await orderModel.findOne({ _id: OrderId }).populate("products.product")
        res.render("order-details", { order })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const list_coupon = async (req, res, next) => {
    try {
        const couponList = await couponModel.find({ delete: false })
        res.render("coupon-list", { couponList })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
const load_add_coupon = async (req, res, next) => {
    try {
        res.render("add-coupon")
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const post_add_coupon = async (req, res, next) => {
    try {
        let { name, code, date, amount, quantity } = req.body
        date = parseInt(date)
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + (date * 24 * 60 * 60 * 1000));

        const newCoupon = new couponModel({
            name: name,
            code: code,
            issued_date: currentDate,
            validUpTo: futureDate,
            amount: amount,
            quantity: quantity
        })
        await newCoupon.save().then(() => res.redirect("/admin/coupon-list"))
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const update_order = async (req, res, next) => {
    try {
        const { orderid, name } = req.body
        const Order = await orderModel.findOneAndUpdate({ _id: orderid }, {
            $push: {
                orderstatus: name
            }
        })
        res.json({ status: true, name: name })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const remove_image = async (req, res, next) => {
    try {
        const { id, image } = req.body
        const product = await productModidy.findOne({ _id: id })
        if (product.image.length > 1) {

            const result = await productModidy.findOneAndUpdate({ _id: id },
                { $pull: { image: image } })
            res.json({ status: true })
        } else {
            res.json({ status: false })
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const add_image = async (req, res, next) => {
    try {
        const { id } = req.body

        const result = await productModidy.findOneAndUpdate(
            { _id: id },
            { $push: { image: req.files.map(file => file.filename) } },
            { new: true } // return the updated document instead of the original document
        );
        res.redirect(`/admin/edit-product/${id}`)

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_category_edit = async (req, res, next) => {
    try {
        const id = req.params.id
        const categorydetails = await categorydata.findOne({ _id: id });
        res.render("edit-category", { categorydetails })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const update_category = async (req, res, next) => {
    try {
        const category = req.body.id
        const name = req.body.name
        const detiails = await categorydata.findOneAndUpdate({ _id: category }, {
            $set: {
                category: name
            }
        })

        res.redirect("/admin/categorylist")
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const delete_category = async (req, res, next) => {
    try {
        const category = req.body.name
        const detiails = await categorydata.findOneAndUpdate({ category: category }, {
            $set: {
                delete: 1
            }
        })
        res.json({
            status: true
        })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const undo_category = async (req, res, next) => {
    try {
        const category = req.body.name
        const detiails = await categorydata.findOneAndUpdate({ category: category }, {
            $set: {
                delete: 0
            }
        })
        res.json({
            status: true
        })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const disable_coupon = async (req, res, next) => {
    try {
        const couponid = req.body.id
        const result = await couponModel.findOneAndUpdate(
            { _id: couponid },
            {
                disable: true
            }
        ).then(() => {
            res.json({ status: true })
        })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const enable_coupon = async (req, res, next) => {
    try {
        const couponid = req.body.id
        const result = await couponModel.findOneAndUpdate(
            { _id: couponid },
            {
                disable: false
            }
        ).then(() => {
            res.json({ status: true })
        })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const offer_post = async (req, res, next) => {
    try {
        const { offerpercentage, product } = req.body
        const productdata = await productModidy.findOne({ _id: product })
        if (productdata.offer.status) {
            let amount = productdata.offerprice - ((productdata.price / 100) * offerpercentage)
            const update = await productModidy.findOneAndUpdate(
                { _id: product },
                {
                    $set: {
                        offer: {
                            status: true,
                            amount: offerpercentage
                        },
                        offerprice: productdata.price,
                        price: amount
                    }
                }
            ).then(() => {
                res.json({ status: true })
            })
        } else {

            let amount = productdata.price - ((productdata.price / 100) * offerpercentage)
            const update = await productModidy.findOneAndUpdate(
                { _id: product },
                {
                    $set: {
                        offer: {
                            status: true,
                            amount: offerpercentage
                        },
                        offerprice: productdata.price,
                        price: amount
                    }
                }
            ).then(() => {
                res.json({ status: true })
            })
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const delete_offer = async (req, res, next) => {
    try {
        const id = req.params.id
        const productdata = await productModidy.findOne({ _id: id })

        await productModidy.findOneAndUpdate({ _id: id }, {
            $set: {
                offer: {
                    status: false
                },
                offerprice: 0,
                price: productdata.offerprice
            }
        }).then(() => {
            res.redirect(`/admin/edit-product/${id}`)
        })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const load_coupon_edit = async (req, res, next) => {
    try {
        const couponId = req.params.id;
        const coupon = await couponModel.findOne({ _id: couponId })
        req.session.couponId = coupon
        res.render('coupon-edit', { coupon })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
const update_coupon = async (req, res, next) => {
    try {
        let { name, code, date, amount, quantity } = req.body
        date = parseInt(date)
        const currentDate = new Date(req.session.couponId.issued_date)
        const futureDate = new Date(currentDate.getTime() + (date * 24 * 60 * 60 * 1000));

        await couponModel.findByIdAndUpdate({ _id: req.session.couponId._id }, {
            $set: {
                name: name,
                code: code,
                issued_date: currentDate,
                validUpTo: futureDate,
                amount: amount,
                quantity: quantity
            }
        }).then(() => {
            res.redirect('/admin/coupon-list')
        })
    } catch (error) {
        console.log(error.message);
        next()
    }
}
const remove_coupon = async (req, res, next) => {
    try {
        const couponid = req.body.id
        const result = await couponModel.findOneAndUpdate({ _id: couponid }, {
            $set: { delete: true }
        })
        res.join({ status: true })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const downloadpdf = async (req, res, next) => {
    try {
        const tableData = await orderModel.find()
        const csvHeader = [
            { id: 'user', title: 'User' },
            { id: 'totalprice', title: 'Total price' },
            { id: 'paymentstatus', title: 'paymentstatus' }
        ];

        // Create a CSV writer and write the table data to a CSV file
        const csvWriter = createCsvWriter({
            path: 'table.csv',
            header: csvHeader
        });
        await csvWriter.writeRecords(tableData);

        // Set the headers to trigger a file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=table.csv');

        // Send the CSV file to the client for download
        res.download('table.csv', 'table.csv', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error generating CSV file');
            }
        });
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const pdfPage = async (req, res, next) => {
    try {
        const orders = downloadingContent

        res.render('orderlist-pdf', { orders })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
module.exports = {
    pdfPage,
    downloadpdf,

    remove_coupon,
    update_coupon,
    load_coupon_edit,

    delete_offer,
    offer_post,

    disable_coupon,
    enable_coupon,


    undo_category,
    delete_category,
    update_category,
    load_category_edit,
    add_image,
    update_order,
    remove_image,

    post_add_coupon,
    load_add_coupon,
    list_coupon,
    view_order,
    load_order_list,

    update_product,
    load_edit_product,

    load_sign_in,
    load_home,
    logout,
    post_login,


    user_list,
    block,
    un_block,

    load_insert_product,
    insert_product,
    product_list,
    delete_product,
    undo_delete_product,

    load_profile,

    load_category,
    insert_category,
    category_list

}