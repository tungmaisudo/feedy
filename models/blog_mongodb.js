var Blog = require('./connect_db').Blog;
var mongoose = require('./connect_db').mongoose;

module.exports = Blog;

//create blog
module.exports.createBlog = function (newBlog, callback) {
    newBlog.save(callback);
}

module.exports.getLengthBlog = function (callback) {
    Blog.count({}, callback);
}

module.exports.getBlog = function (page, callback) {
    Blog.find({}, {}, { sort: { '_id': -1 }, skip: page * 3, limit: 3 }, callback);
}

module.exports.getAllBlog = function (countGet, callback) {
    Blog.aggregate([{ "$skip": countGet }, { "$limit": 3 }], callback);
}

module.exports.addLikeBlog = function (idUser, idBlog, callback) {
    Blog.update({ _id: mongoose.Types.ObjectId(idBlog) }, { $push: { like: idUser } }, callback);
}

module.exports.removeLikeBlog = function (idUser, idBlog, callback) {
    Blog.update({ _id: mongoose.Types.ObjectId(idBlog) }, { $pull: { like: idUser } }, callback);
}

module.exports.addSaveBlog = function (idUser, idBlog, callback) {
    Blog.update({ _id: mongoose.Types.ObjectId(idBlog) }, { $push: { is_save: idUser } }, callback);
}

module.exports.removeSaveBlog = function (idUser, idBlog, callback) {
    Blog.update({ _id: mongoose.Types.ObjectId(idBlog) }, { $pull: { is_save: idUser } }, callback);
}

module.exports.createComment = function (idBlog, comment, callback) {
    Blog.findOneAndUpdate({ _id: mongoose.Types.ObjectId(idBlog) }, { $push: { comment: comment } }, { 'new': true }, callback);
}

module.exports.getComment = function (idBlog, callback) {
    Blog.findOne({ _id: mongoose.Types.ObjectId(idBlog) }, function (err, document) {
        if (err) callback(err, null)
        callback(null, document.comment)
    });
}

module.exports.addLikeComment = function (idBlog, idComment, idUser, callback) {
    Blog.update({ _id: mongoose.Types.ObjectId(idBlog), 'comment._id':idComment}, { $push: { 'comment.$.votes': idUser } }, callback);
}

module.exports.removeLikeComment = function (idBlog, idComment, idUser, callback) {
    Blog.update({ _id: mongoose.Types.ObjectId(idBlog), 'comment._id': idComment }, { $pull: { 'comment.$.votes': idUser } }, callback);
}

module.exports.createReply = function (idBlog, idComment, reply, callback) {
    Blog.findOneAndUpdate({ _id: mongoose.Types.ObjectId(idBlog), 'comment._id': mongoose.Types.ObjectId(idComment) }, { $push: { 'comment.$.reply': reply } }, callback);
}


