let db = require('../config/connection');
let collections = require('../config/collections');
let bcrypt = require('bcrypt');
let objectId = require('mongodb').ObjectId;

module.exports = {
    // doAdminSignup : (adminData)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         adminData.password = await bcrypt.hash(adminData.password,10);
    //         db.get().collection('admin').insertOne(adminData).then(()=>{
    //             resolve();
    //         })
    //     })
    // },
    doAdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let admin = await db.get().collection('admin').findOne({ email: adminData.email });
            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((status) => {
                    if (status) {
                        response.admin = admin;
                        response.status = status;
                        resolve(response);
                    }
                    else {
                        response.status = false;
                        response.errorMsg = "Invalid password";
                        resolve(response);
                    }
                })
            }
            else {
                response.status = false;
                response.errorMsg = "Email is not matching";
                resolve(response);
            }
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let allOrders = await db.get().collection(collections.ORDER_COLLECTIONS).aggregate([
                {
                    $lookup: {
                        from: collections.USER_COLLECTIONS,
                        let: { userIdStr: { $toObjectId: '$userId' } },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$userIdStr'] } } }
                        ],
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: '$userDetails'
                },
                {
                    $unwind: '$orderedProducts'
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLECTIONS,
                        localField: 'orderedProducts.item',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $unwind: '$productDetails'
                },
                {
                    $group: {
                        _id: '$_id',
                        userId: { $first: '$userId' },
                        deliveryDetails: { $first: '$deliveryDetails' },
                        orderStatus: { $first: '$orderStatus' },
                        paymentMethod: { $first: '$paymentMethod' },
                        totalAmount: { $first: '$totalAmount' },
                        orderingTime: { $first: '$orderingTime' },
                        userDetails: { $first: '$userDetails' },

                        // Build a new products array
                        products: {
                            $push: {
                                _id: '$productDetails._id',
                                name: '$productDetails.name',
                                price: '$productDetails.price',
                                quantity: '$orderedProducts.quantity'
                                // Add more product fields if needed
                            }
                        }
                    }
                }
            ]).toArray();
            resolve(allOrders);
        })
    },
    changeOrderStatus: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTIONS).updateOne({ _id: new objectId(data.orderId) },
                {
                    $set: {
                        orderStatus: data.orderStatus
                    }
                }).then(() => {
                    resolve();
                })
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let allUsers = await db.get().collection(collections.USER_COLLECTIONS).find().toArray();
            resolve(allUsers);
        })
    },
    removeUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CART_COLLECTIONS).deleteOne({user : new objectId(userId)});
            console.log(cart);
            let orders = await db.get().collection(collections.ORDER_COLLECTIONS).deleteMany({userId: userId});
            console.log(orders);
            let user = await db.get().collection(collections.USER_COLLECTIONS).deleteOne({_id : new objectId(userId)});
            console.log(user);
            resolve();
        })
    }
}