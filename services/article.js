var MongoDb = require("mongodb"),
    ObjectID = MongoDb.ObjectID,
    db = new MongoDb.Db("test", new MongoDb.Server("localhost", 27017, {auto_reconnect: true}, {})),
    fs = require("fs");

db.open(function (err, db) {});

exports.findAll = function (callback) {
    db.collection("articles", function (err, collection) {
        collection.find().toArray(callback);
    });
};

exports.findById = function (id, callback) {
    db.collection("articles", function (error, collection) {
        collection.findOne({_id: new ObjectID(id)}, callback);
    });
};

exports.save = function (input, image, callback) {
    input.date = new Date();
    if (input._id) {
        input._id = new ObjectID(input._id);
    }

    if (image && image.length) {
        var data = fs.readFileSync(image.path);
        input.image = new MongoDb.Binary(data);
        input.imageType = image.type;
        input.imageName = image.name;
    }

    db.collection("articles", function (error, collection) {
        collection.save(input, {safe: true}, callback);
    });
};