const userModify = require('../models/user')

const result = ((req,res,next)=>{
    try {
        if(req.session.login){
            res.redirect('/home')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
})
const homeallow = async (req,res,next)=>{
    try {
        if(req.session.login){
            const id  = req.session.login._id
            const user = await userModify.findOne({_id:id})
            req.session.login = user
            next()
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const emailcheck = async(req,res,next)=>{
    try {
        if(req.session.email){
            next()
        }else{
            res.redirect('/register')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const cartCheck = async (req,res,next)=>{
    try {
        if(req.session.login.cart.length > 0 ){
            next()
        }else{
            res.redirect("/view-cart")
        }
        
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
module.exports = {
    result,
    homeallow,
    emailcheck,
    cartCheck
}