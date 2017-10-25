var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://users:1234@ds117348.mlab.com:17348/feedy');

// var Schema = mongoose.Schema;

// create a schema
var userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true },
    password: { type: String, required: true },
    gender: Boolean,
    image: String,
    birth: String,
    active: Boolean
});
var User = module.exports = mongoose.model('User', userSchema);

var blogSchema = new mongoose.Schema({
    user: {
        user_id: String,
        user_name: String,
        user_image: String
    },
    content: String,
    time: String,
    images: Array,
    is_save: Array,
    like: Array,
    comment: [{
        _id: Number,
        user: {
            user_id: String,
            user_name: String,
            user_image: String
        },
        content: String,
        time: String,
        votes: Array
    }]
});
var Blog = module.exports = mongoose.model('Blog', blogSchema);

var feedyUserSchema = new mongoose.Schema({
    user: {
        user_id: String,
        user_name: String,
        user_image: String
    },
    name_feedy: String,
    image_feedy: String,
    intro_feedy: String,
    valuation_feedy: [{
        user_id: String,
        valuation_vote: Number
    }],
    time_prepare: String,
    time_making: String,
    level: String,
    making: [{
        content: String,
        images: String
    }],
    prepare: [{
        prepare_quantity: String,
        prepare_content: String,
        prepare_unit: String,
    }],
    time: String
})

var FeedyUser = module.exports = mongoose.model('FeedyUser', feedyUserSchema)

var tipsSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    tips: String
})

var Tips = module.exports = mongoose.model('Tips', tipsSchema)

module.exports = {
    User: User,
    Blog: Blog,
    FeedyUser: FeedyUser,
    Tips: Tips,
    mongoose: mongoose
};