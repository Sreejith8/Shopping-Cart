let db = require('../config/connection');
let collections = require('../config/collections');
let objectId = require('mongodb').ObjectId;

module.exports = {
    addProduct : (product,callback)=>{
        console.log(product);
        db.get().collection(collections.PRODUCT_COLECTIONS).insertOne(product).then((data)=>{
            callback(data.insertedId);
        })
    },
    getProduct : ()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collections.PRODUCT_COLECTIONS).find().toArray();
            resolve(products);
        })
    },
    deleteProduct : (productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLECTIONS).deleteOne({_id:new objectId(productId)}).then((response)=>{
                if(response.deletedCount === 1){
                    resolve(productId);
                }
                else{
                    resolve();
                }
            })
        })
    },
    getProductDetails : (productId)=>{
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collections.PRODUCT_COLECTIONS).findOne({_id : new objectId(productId)});
            resolve(product);
        })
    },
    updateProductDetails : (productId,productDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLECTIONS).updateOne({
                _id:new objectId(productId)
            },{
                $set : {
                    name : productDetails.name,
                    category : productDetails.category,
                    description : productDetails.description,
                    price : productDetails.price
                }
            }).then((response)=>{
                resolve(response);
            })
        })
    }
}