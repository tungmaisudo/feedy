var Tips = require('./connect_db').Tips;
var mongoose = require('./connect_db').mongoose;
var async = require('async')

module.exports = Tips;

module.exports = {
    createTips: function (newTips, callback) {
        Tips.create(newTips, callback)
    },

    getTips: function (id, callback) {
        Tips.find({ _id: mongoose.Types.ObjectId(id) }, function (err, results) {
            if (err) callback(err, null)
            // results['valuation_vote'] = 3
            callback(null, results[0].tips)
        })
    },

    getListTips: function (page,callback) {
        Tips.find({}, {}, { sort: { '_id': -1 }, skip: page * 10, limit: 10 }, function (err, results) {
            if (err) callback(err, null)
            async.map(results, function (document, callback) {
                let feedyUser = {
                    tips_id: document._id,
                    title: document.title,
                    image: document.image,
                    description: document.description
                }
                callback(null, feedyUser)
            }, function (err, result) {
                if (err) callback(err, null)
                callback(null, result)
            })
        })
    }
}

// module.exports.getListTips = function (callback) {

// }

// module.exports.getTips = function (id, callback) {
//     // Tips.find({ name_feedy: jJj }, function (err, results) {
//     //     if (err) callback(err, null)
//     //     console.log(results)
//     //     callback(null, results)
//     // })
// }
