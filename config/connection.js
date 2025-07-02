let MongoClient = require('mongodb').MongoClient;

let state = {
    db: null
};

module.exports.connect = async function() {
    const url = "mongodb://localhost:27017";
    const dbName = "ShoppingCart";
    try{
        const client = await MongoClient.connect(url);
        state.db = client.db(dbName);
        console.log("Mongodb connected successfully");
    }
    catch(error){
        console.log(error);
        throw error;
    }
};

module.exports.get = function() {
    return state.db;
};