const productView = require('../models/product')
const categorySearch = require('../models/catogory')

const search_result = async (req, res, next) => {
    try {
        const products = await productView.find({ delete: 0 }).populate("category")
        let category = []
        for(let i=0 ;i < products.length ; i++){
            let notpresent =  false
            for(let j=0 ; j<category.length;j++){
                if(category[j] == products[i].category.category){
                    notpresent = true
                    break
                }
            }
            if(notpresent == false){
                category[category.length] =  products[i].category.category
            }


        }
        req.session.category = category
        req.session.products = products;

        next();
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const productLook = async (req, res, next) => {
    try {
        const prid = req.params.id
        if (req.session.login) {
            next()
        } else {
            res.redirect(`/product/${prid}`)
        }

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const productGet = async (req, res, next) => {
    try {
        const prid = req.params.id
        if (req.session.login) {
            res.redirect(`/product-home/${prid}`)
        } else {
            next()
        }

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const search_dynamic_result = async (req, res, next) => {
    try {
        let search = req.body.search
        search = search.toLowerCase();
        let regExp = new RegExp(search);
        const product = await productView.find({
            $or: [
                { name: new RegExp(`^${search}`) },

            ],
        })
        const category = await categorySearch.find({
            $or: [
                { category: new RegExp(`^${search}`) },

            ],
        })
        res.json({ product, category })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const search = async (req, res, next) => {
    try {
        if (req.query.search) {
            let search = req.query.search
            let categorydata = await categorySearch.find({ category: new RegExp(`^${search}`) });
            let products
            let searchcategory = [{ name: new RegExp(`^${search}`), delete: 0 }]
            
            if (categorydata.length > 0) {
                for (let i = 0; i < categorydata.length; i++) {
                    searchcategory.push({ category: categorydata[i]._id, delete: 0 })
                }
            }
            products = await productView.find({
                $or: searchcategory
            }).populate("category")
            const category = []
            for (let i = 0; i < products.length; i++) {
                checkingarray(category, products[i].category.category)
            }
            if(req.session.login){

                res.render('shop-after', { products, category,user:req.session.login })
            }else{
                res.render('shop-before', { products, category,user:false })
            }
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message)
    }
}

function checkingarray(arr, elem) {
    if (arr.indexOf(elem) === -1) {
        arr.push(elem);
    }
    return arr;
}
module.exports = {
    search_dynamic_result,
    productLook,
    search_result,
    productGet,
    search
}