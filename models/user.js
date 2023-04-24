const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_verfied: {
        type: Number,
        default: 0
    }, address: [
        {
            house: { type: String },
            post: { type: Number },
            city: { type: String },
            state: { type: String },
            district: { type: String }
        }
    ],
    blockuser: {
        type: Boolean,
        default: false
    },
    cart: [
        {
            product: {
                type: String,
                ref: 'product'
            },
            quantity: {
                type: Number,
            },
            total: {
                type: String
            },
            offer: {
                offer: {
                    type: Boolean,
                    default: false
                },
                price: {
                    type: Number
                }
            }
        }
    ],
    userorders: [
        {
            orderid: {
                type: String,
                ref: 'orders'
            }
        }
    ],
    wishlist: [
        {
            product: {
                type: String,
                ref: 'product'
            }
        }
    ],
    wallet: {
        type: Number,
        default: 0
    }
})
module.exports = mongoose.model('user', userSchema)