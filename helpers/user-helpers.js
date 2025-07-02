const db = require('../config/connection');
const collections = require('../config/collections');
const bcrypt = require('bcrypt');
const { response } = require('express');
const { resolve } = require('promise');
const objectId = require('mongodb').ObjectId;
const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let user = {
                _id: null,
                name: userData.name,
                email: userData.email,
                password: userData.password
            };
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collections.USER_COLLECTIONS).insertOne(userData).then((data) => {
                user._id = data.insertedId.toString();
                resolve(user);
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            console.log(userData.email);
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ email: userData.email });
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("Login successful");
                        response.user = user;
                        response.status = status;
                        resolve(response);
                    }
                    else {
                        console.log("Password doesn't match");
                        resolve({ status: false });
                    }
                })
            } else {
                console.log("Mail id not signup");
                resolve({ status: false });
            }
        })
    },
    addToCart: (userId, productId) => {
        let productObject = {
            item: new objectId(productId),
            quantity: 1
        };
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CART_COLLECTIONS).findOne({ user: new objectId(userId) });
            if (cart) {
                let cartExist = cart.products.findIndex(product => product.item == productId);
                if (cartExist != -1) {
                    db.get().collection(collections.CART_COLLECTIONS)
                        .updateOne({ 'products.item': new objectId(productId), user: new objectId(userId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
                                resolve();
                            })
                }
                else {
                    db.get().collection(collections.CART_COLLECTIONS)
                        .updateOne({ user: new objectId(userId) },
                            {
                                $push: {
                                    products: productObject
                                }
                            }).then((response) => {
                                resolve();
                            })
                }
            }
            else {
                let cartObject = {
                    user: new objectId(userId),
                    products: [productObject]
                }
                db.get().collection(collections.CART_COLLECTIONS).insertOne(cartObject).then((response) => {
                    resolve();
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartProducts = await db.get().collection(collections.CART_COLLECTIONS).aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLECTIONS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }
            ]).toArray();
            console.log(cartProducts);
            resolve(cartProducts);
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartCount = 0;
            let cart = await db.get().collection(collections.CART_COLLECTIONS).findOne({ user: new objectId(userId) });
            if (cart) {
                cartCount = cart.products.length;
            }
            resolve(cartCount);
        })
    },
    changeProductQuantity: (data) => {
        return new Promise((resolve, reject) => {
            let count = parseInt(data.count);
            let quantity = parseInt(data.quantity);
            console.log(quantity, count)
            if (quantity === 1 && count === -1) {
                db.get().collection(collections.CART_COLLECTIONS)
                    .updateOne({ _id: new objectId(data.cartId) },
                        {
                            $pull: {
                                products: {
                                    item: new objectId(data.productId)
                                }
                            }
                        }).then((response) => {
                            resolve({ productRemoved: true })
                        })
            } else {
                db.get().collection(collections.CART_COLLECTIONS)
                    .updateOne({ 'products.item': new objectId(data.productId), _id: new objectId(data.cartId) },
                        {
                            $inc: { 'products.$.quantity': count }
                        }).then((response) => {
                            resolve(response);
                        })
            }
        })
    },
    removeProduct: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTIONS)
                .updateOne({ _id: new objectId(data.cartId) },
                    {
                        $pull: {
                            products: {
                                item: new objectId(data.productId)
                            }
                        }
                    }).then((response) => {
                        resolve({ productRemoved: true });
                    })
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.CART_COLLECTIONS).aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLECTIONS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply: ['$quantity', { $toDouble: '$product.price' }]
                            }
                        }
                    }
                }
            ]).toArray();
            resolve(total[0].total);
        })
    },
    getProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CART_COLLECTIONS).findOne({ user: new objectId(userId) });
            resolve(cart.products);
        })
    },
    placeOrder: (userData, orderedProducts, totalAmount) => {
        return new Promise((resolve, reject) => {
            let orderStatus = userData['payment-method'] === "COD" ? 'Ordered' : "Pending";
            let orderObject = {
                userId: userData.userId,
                deliveryDetails: {
                    address: userData.address,
                    pincode: userData.pincode,
                    mobile: userData.mobile
                },
                orderStatus: orderStatus,
                paymentMethod: userData['payment-method'],
                totalAmount: totalAmount,
                orderedProducts: orderedProducts,
                orderingTime: new Date()
            }
            db.get().collection(collections.ORDER_COLLECTIONS).insertOne(orderObject).then((response) => {
                db.get().collection(collections.CART_COLLECTIONS).deleteOne({ user: new objectId(userData.userId) })
                resolve(response.insertedId.toString());
            })
        })
    },
    getOrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.get().collection(collections.ORDER_COLLECTIONS).find({ userId: userId }).toArray()
            resolve(orderDetails);
        })
    },
    getOrderedProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderedProducts = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $match: { _id: new objectId(orderId) }
                },
                {
                    $unwind: '$orderedProducts'
                },
                {
                    $project: {
                        item: '$orderedProducts.item',
                        quantity: '$orderedProducts.quantity',
                        orderStatus: '$orderStatus'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLECTIONS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        },
                        orderStatus: 1
                    }
                }
            ]).toArray();
            resolve(orderedProducts);
        })
    },
    generateRazorpay: (orderId,totalAmount) => {
        return new Promise((resolve,reject)=>{
            instance.orders.create({
                amount: totalAmount,
                currency: "INR",
                receipt: orderId
            },(error,order)=>{
                resolve(order);
            })
        })
    },
    verifyPayment : (data)=>{
        return new Promise((resolve,reject)=>{
            let {createHmac,} = require('node:crypto');
            let hmac = createHmac('sha256','pdXr5OtTJT3NDGml7Xk2CJAb')
            hmac.update(data['response[razorpay_order_id]']+"|"+data['response[razorpay_payment_id]']);
            let generatedSignature = hmac.digest('hex');
            if(generatedSignature === data['response[razorpay_signature]']){
                resolve();
            }
            else{
                reject();
            }
        })
    },
    changePaymentStatus: (data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTIONS)
            .updateOne({_id: new objectId(data['orderDetails[receipt]'])},
            {
                $set : {
                    orderStatus : "Placed"
                }
            }).then((response)=>{
                resolve();
            })
        })
    }
}