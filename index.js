require('./config/mongoose')();
const express = require('express');
const noCache = require('nocache');
const session = require('express-session')


const userRoute = require('./routes/user')
const adminRoute = require('./routes/admin')
const errorRoute = require('./routes/error')
require('dotenv').config({ path: __dirname + '/config/.env' })

const app = express();


app.use((req, res, next) => {
    res.set('Cache-control', `no-store,no-cache,must-revalidate`)
    next()
})
app.use(noCache());
app.use(express.static('public'))

app.set('view engine', 'ejs')
app.set('views', './views')
app.use(session({ secret: 'User', saveUninitialized: false, resave: false, cookie: { maxAge: 6000000 } }));


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', userRoute)
app.use('/admin', adminRoute)
app.set('views', './views/error')
app.use((err, req, res, next) => {
    console.error(err.stack);
    const error = {
        status:502,
        message:"Server error"
    }
    res.render('error-404',{error})
});
app.use('/*', errorRoute)

app.listen(process.env.PORT, () => console.log("server is running"))