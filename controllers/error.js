
const error_404 = async (req,res)=>{
    const error = {
        status:404,
        message:"Page Not Found"
    }
    res.render('error-404',{error})
}
module.exports = {
error_404
}