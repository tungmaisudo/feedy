var User = require('./connect_db').User;
var mongoose = require('./connect_db').mongoose;
// mongoose.Promise = global.Promise;
// // mongoose.connect('mongodb://localhost/feedy');

// // var Schema = mongoose.Schema;

// // // create a schema
// // var userSchema = new Schema({
// //     name: String,
// //     email: { type: String, required: true, unique: true },
// //     password: { type: String, required: true },
// //     gender: Boolean,
// //     image: String,
// //     birth: String,
// //     blogs: Array,
// //     active: Boolean
// // });

// // the schema is useless so far
// // we need to create a model using it
// // var User = module.exports = mongoose.model('User', userSchema);

// // make this available to our users in our Node applications
module.exports = User;

module.exports.createUser = function (newUser, callback) {
    // console.log(newUser);
    newUser.save(callback);
}

module.exports.findUserEmail = function (email, callback) {
    User.find({ email: email }, callback);
}

module.exports.findUserId = function (id, callback) {
    // console.log(mongoose.Types.ObjectId(id)+"a");
    User.findById(mongoose.Types.ObjectId(id), callback);
}

module.exports.verityAccount = function (id, callback) {
    User.update({ _id: id }, { $set: { active: true } }, callback);
}

module.exports.loginAccount = function (email, password, callback) {
    User.find({ email: email, password: password }, callback);
}

module.exports.changePassword = function (id, newPassword, callback) {
    User.update({ _id: id }, { $set: { password: newPassword } }, callback);
}

// module.exports.addBlog = function (idUser, idBlog, callback) {
//     User.findByIdAndUpdate({ _id: idUser }, { $push: { blogs: idBlog } }, callback);
// }

// module.exports.getUserForBlog = function(id,callback){
//     User.findById(mongoose.Types.ObjectId(id), callback);
// }