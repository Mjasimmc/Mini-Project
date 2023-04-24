const OrderModel = require('../models/orders')
const moment = require("moment")
const searchOrder = async (req, res, next) => {
    try {
        const one =moment().format('YYYY-MM-DD')

        let two = moment().subtract(1, 'day').format('YYYY-MM-DD');
        let three = moment().subtract(1, 'day').format('YYYY-MM-DD');
        let four = moment().subtract(1, 'day').format('YYYY-MM-DD');
        let five = moment().subtract(1, 'day').format('YYYY-MM-DD');
        let six = moment().subtract(1, 'day').format('YYYY-MM-DD');
        let seven = moment().subtract(1, 'day').format('YYYY-MM-DD');


        let oneSum = 0
        let twoSum = 0
        let threeSum = 0
        let fourSum = 0
        let fiveSum =0 
        let sixSum = 0
        let sevenSum = 0

        let totalSum = 0
        let totalOrders = 0
        let todayOrders = 0
        const todayOrder = await OrderModel.find();
        todayOrder.forEach(element => {
            let date = moment(element.orderdate, 'MMMM Do YYYY, h:mm:ss a');

            // Format the date
            date = date.format('YYYY-MM-DD');
            if (element.orderstatus[element.orderstatus.length - 1] != "order cancelled") {
                totalSum += element.totalprice
                totalOrders ++
                if (date == one) {
                    todayOrders++
                    oneSum += element.totalprice
                } else if (two == date) {
                    twoSum += element.totalprice
                }else if (three == date) {
                    threeSum += element.totalprice
                }else if (four == date) {
                    fourSum += element.totalprice
                }else if (five == date) {
                    fiveSum += element.totalprice
                }else if (six == date) {
                    sixSum += element.totalprice
                }else if (seven == date) {
                    sevenSum += element.totalprice
                }
            }
        });
        req.session.todaySales = {
            one:one,
            two:two,
            three:three,
            four:four,
            five:five,
            six:six,
            seven:seven,
            totalOrders:totalOrders,
            todayOrders:todayOrders,

            oneSum: oneSum,
            twoSum: twoSum,
            threeSum:threeSum,
            fourSum:fourSum,
            fiveSum:fiveSum,
            sixSum:sixSum,
            sevenSum:sevenSum,
            


            totalSum:totalSum,
        }
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
};


module.exports = searchOrder