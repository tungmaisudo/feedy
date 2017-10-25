var FeedyUser = require('./connect_db').FeedyUser
var User = require('../models/connection_mongodb');
var mongoose = require('./connect_db').mongoose
var async = require('async')

module.exports = FeedyUser

module.exports.createFeedyUser = (feedyUser, callback) => {
    // console.log(feedyUser)
    // feedyUser.save(callback)
    FeedyUser.create(feedyUser, callback)
}

module.exports.getFeedyUser = (page, callback) => {
    FeedyUser.find({}, {}, { sort: { '_id': -1 }, skip: page * 6, limit: 6 }, function (err, results) {
        // if (err) callback(err, null)
        async.map(results, function (document, callback) {
            //     User.findUserId(document.user_id, function (err, user) {
            // if (err) callback(err, null)
            let feedyUser = {
                feedy_id: document._id,
                user_id: document.user.user_id,
                name_user: document.user.user_name,
                image_user: document.user.user_image,
                name_feedy: document.name_feedy,
                image_feedy: document.image_feedy
            }
            callback(null, feedyUser)
            //         })
        }, function (err, result) {
            if (err) callback(err, null)
            callback(null, result)
        })
    })
}

module.exports.getContentFeedyUser = (idFeedy, callback) => {
    FeedyUser.find({ _id: idFeedy }, function (err, results) {
        if (err) callback(err, null)
        results['valuation_vote'] = 3
        callback(null, results)
    })
}
module.exports.getListFeedyByIdUser = function (idUser, page, callback) {
    // console.log(idUser)
    FeedyUser.find({ 'user.user_id': idUser }, {}, { sort: { '_id': -1 }, skip: page * 6, limit: 6 }, function (err, results) {
        if (err) callback(err, null)
        async.map(results, function (document, callback) {
            //     User.findUserId(document.user_id, function (err, user) {
            // if (err) callback(err, null)
            let feedyUser = {
                feedy_id: document._id,
                user_id: document.user.user_id,
                name_user: document.user.user_name,
                image_user: document.user.user_image,
                name_feedy: document.name_feedy,
                image_feedy: document.image_feedy
            }
            callback(null, feedyUser)
            //         })
        }, function (err, result) {
            if (err) callback(err, null)
            callback(null, result)
        })
    })
}

module.exports.addStarByUser = function (idFeedy, idUser, star, callback) {
    let valuation = {
        user_id: idUser,
        valuation_vote: star
    }
    // callback
    FeedyUser.update({ _id: mongoose.Types.ObjectId(idFeedy) }, { $push: { 'valuation_feedy': valuation } }, callback);
}

module.exports.deleteFeedyById = function (idFeedy, callback) {
    FeedyUser.findByIdAndRemove({ _id: mongoose.Types.ObjectId(idFeedy) }, callback)
}