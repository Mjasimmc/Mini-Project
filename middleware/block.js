const userModify = require('../models/user')
const block = async (req,res,next)=>{
    try {
        const id = req.session.login._id
        const user = await userModify.findOne({_id:id})
        if(user.blockuser){
            req.session.loginmessage = "Your Account is blocked"
            req.session.login = false
            res.redirect('/login')
        }else{
            req.session.login = user
            next()
        }
        
    } catch (error) {
        next(error)
    }
}
module.exports = block