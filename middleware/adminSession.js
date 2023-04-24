const notLogged = ((req,res,next)=>{
    try {
        if(req.session.adminlogin){
            res.redirect('/admin/home')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
})

const logged = async (req,res,next)=>{
    try {
        if(req.session.adminlogin){
            next()
        }else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

module.exports = {
    notLogged,
    logged
}
// to middle ware