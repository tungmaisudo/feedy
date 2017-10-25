var express = require('express');
var router = express.Router();
var fs = require('fs');
var async = require('async')

var multer = require('multer');
var uploads = multer({ dest: './uploads/blogs' });


var Blog = require('../models/blog_mongodb');
var User = require('../models/connection_mongodb');

const URL_SERVER = require('../models/url_server');


/* GET users listing. */
// router.get('/', function (req, res, next) {
//     res.send('get blog');
// });


router.post('/postblog', uploads.any(), function (req, res, next) {
    let userId = req.body.user_id
    let userName = req.body.user_name
    let userImage = req.body.user_image
    let user = {
        user_id: userId,
        user_name: userName,
        user_image: "/users" + userImage.substring(userImage.lastIndexOf('/'), userImage.length)
    }
    // console.log(user)
    let content = req.body.content;
    let time = req.body.time;
    let files = req.files;
    if (files) {
        // console.log("Uploading File...");
        // console.log(req.files);
        var urlImage = '/blog/getimage?id=';
        var profileImageName = [];
        for (var file in files) {
            profileImageName.push(urlImage + files[file].filename);
            //   console.log(req.files.filename);
        }
        // console.log(profileImageName);
        var insertValue = new Blog({
            'user': user,
            'content': content,
            'time': time,
            'images': profileImageName,
            'is_save': [],
            'like': [],
            'comment': []
        });
        // console.log(insertValue);
        Blog.createBlog(insertValue, function (err, result) {
            if (err) return res.json(err);
            var blog_id = result._id;
            // console.log(blog_id);
            // User.addBlog(id_user, blog_id, function (err, resultUser) {
            //     if (err) return res.json(err);
            return res.json("Done");
            // });
        });
    } else {
        var profileImageName = [];
        var insertValue = new Blog({
            'user': user,
            'content': content,
            'time': time,
            'images': profileImageName,
            'is_save': [],
            'like': [],
            'comment': []
        });
        Blog.createBlog(insertValue, function (err, result) {
            if (err) return res.json(err);
            var blog_id = result._id;
            // console.log(blog_id);
            // User.addBlog(id_user, blog_id, function (err, resultUser) {
            //     if (err) return res.json(err);
            return res.json("Done");
            // });
        });
    }

});

router.get('/getimage', function (req, res, next) {
    var idImage = req.param('id');
    // console.log(id);
    var urlImage = 'uploads/blogs/' + idImage;
    // console.log(urlImage);
    var image = fs.readFileSync(urlImage);
    res.end(image, 'binary');
});

// function getUserForBlog(idUserBlog, idUser, blog, callback) {
//     User.findUserId(idUser, function (err, user) {
//         if (err) return callback(err, null);
//         // console.log(i + "aa");
//         if (blog.is_save.includes(idUserBlog)) {
//             var is_save = true;
//         } else {
//             var is_save = false;
//         }
//         if (blog.like.includes(idUserBlog)) {
//             var is_like = true;
//         } else {
//             var is_like = false;
//         }
//         var result = {
//             id_blog: blog._id,
//             name: user.name,
//             profile_image: user.image,
//             is_save: is_save,
//             content: blog.content,
//             time: blog.time,
//             images: blog.images,
//             comment: blog.comment.length,
//             like: blog.like.length,
//             is_like: is_like
//         };
//         callback(null, result);
//     });
// }

// function asyncLoop(iterations, func, callback) {
//     var index = 0;
//     var done = false;
//     var loop = {
//         next: function () {
//             if (done) {
//                 return;
//             }

//             if (index < iterations) {
//                 index++;
//                 func(loop);

//             } else {
//                 done = true;
//                 callback();
//             }
//         },

//         iteration: function () {
//             return index - 1;
//         },

//         break: function () {
//             done = true;
//             callback();
//         }
//     };
//     loop.next();
//     return loop;
// }

// function getBlog(countGet, idUserBlog, callback) {
//     Blog.getLengthBlog(function (err, length) {
//         if (err) return callback(err, null);
//         var count = length - countGet * 3 - 3;

//         Blog.getAllBlog(count, function (err, document) {
//             if (err) return callback(err, null);
//             var blogs = [];
//             asyncLoop(document.length, function (loop) {
//                 var idUser = document[loop.iteration()].user_id;
//                 var blog = document[loop.iteration()];
//                 getUserForBlog(idUserBlog, idUser, blog, function (err, result) {
//                     if (err) return console.log(err);
//                     blogs.push(result);
//                     loop.next();
//                 });
//             }, function () {
//                 callback(null, blogs);

//             });
//         });

//     });
// }

router.get('/home/:id/:page', function (req, res, next) {
    let page = req.params.page
    let id = req.params.id
    Blog.getBlog(page, function (err, result) {
        if (err) return res.json("Err");

        async.map(result, function (item, callback) {
            if (item.is_save.includes(id)) {
                var is_save = true;
            } else {
                var is_save = false;
            }
            if (item.like.includes(id)) {
                var is_like = true;
            } else {
                var is_like = false;
            }
            var results = {
                _id: item._id,
                user: item.user,
                is_save: is_save,
                content: item.content,
                time: item.time,
                images: item.images,
                comment: item.comment.length,
                like: item.like.length,
                is_like: is_like
            };
            callback(null, results)
        }, function (err, results) {
            if (err) return res.json("Err");
            res.json(results)
        })
        // let arrSave = result.is_save



    })
})


router.post('/like/add', function (req, res, next) {
    var userId = req.body.user_id;
    var blogId = req.body.blog_id;

    Blog.addLikeBlog(userId, blogId, function (err, result) {
        if (err) return res.json(err);
        return res.json(result);
    });
});

router.post('/like/remove', function (req, res, next) {
    var userId = req.body.user_id;
    var blogId = req.body.blog_id;
    // console.log(userId + ":" + blogId);
    // console.log(req.body);
    Blog.removeLikeBlog(userId, blogId, function (err, result) {
        if (err) return res.json(err);
        return res.json(result);
    });
});

router.post('/save/add', function (req, res, next) {
    var userId = req.body.user_id;
    var blogId = req.body.blog_id;
    // console.log(userId + ":" + blogId);
    // console.log(req.body);
    Blog.addSaveBlog(userId, blogId, function (err, result) {
        if (err) return res.json(err);
        return res.json(result);
    });
});

router.post('/save/remove', function (req, res, next) {
    var userId = req.body.user_id;
    var blogId = req.body.blog_id;
    // console.log(userId + ":" + blogId);
    // console.log(req.body);
    Blog.removeSaveBlog(userId, blogId, function (err, result) {
        if (err) return res.json(err);
        return res.json(result);
    });
});

router.post('/comment/create', function (req, res, next) {
    var blogId = req.body.blog_id;
    var userId = req.body.user_id;
    var content = req.body.content;
    var time = req.body.time;
    var vote = [];
    var comment = {
        user_id: userId,
        content: content,
        time: time,
        votes: vote,
        reply: []
    };
    // console.log(comment);
    Blog.createComment(blogId, comment, function (err, result) {
        if (err) return res.json(err);
        return res.json(result);
    });

});

// function getUserForComment(idUserMain, idUser, comment, callback) {
//     User.findUserId(idUser, function (err, user) {
//         if (err) return callback(err, null);
//         // console.log(i + "aa");
//         if (comment.votes.includes(idUserMain)) {
//             var is_like = true;
//         } else {
//             var is_like = false;
//         }
//         var replys = comment.reply;
//         var arrReplys = [];
//         asyncLoop(replys.length, function (loop) {
//             User.findUserId(replys[loop.iteration()].user_id, function (err, userReply) {
//                 if (err) return callback(err, null);

//                 if (replys[loop.iteration()].votes.includes(idUserMain)) {
//                     var is_like_reply = true;
//                 } else {
//                     var is_like_reply = false;
//                 }
//                 // console.log(userReply);
//                 var resultReply = {
//                     // id_user:userReply._id,
//                     id_reply: replys[loop.iteration()]._id,
//                     name: userReply.name,
//                     profile_image: userReply.image,
//                     is_like: is_like_reply,
//                     like_size: replys[loop.iteration()].votes.length,
//                     content: replys[loop.iteration()].content,
//                     time: replys[loop.iteration()].time
//                 }
//                 arrReplys.push(resultReply);
//                 loop.next();
//             });
//         }, function () {
//             var result = {
//                 // id_user: user._id,
//                 id_comment: comment._id,
//                 name: user.name,
//                 profile_image: user.image,
//                 is_like: is_like,
//                 like_size: comment.votes.length,
//                 content: comment.content,
//                 time: comment.time,
//                 reply: arrReplys
//             };
//             callback(null, result);
//         });
//     });
// }

// function getAllComment(idUserMain, idBlog, callback) {
//     Blog.getComment(idBlog, function (err, comments) {
//         if (err) return res.json('Err');
//         var commentsResult = [];
//         asyncLoop(comments.comment.length, function (loop) {
//             // console.log(comments.comment[loop.iteration()]);

//             var idUser = comments.comment[loop.iteration()].user_id;

//             getUserForComment(idUserMain, idUser, comments.comment[loop.iteration()], function (err, result) {
//                 if (err) return callback(err, null);
//                 commentsResult.push(result);
//                 loop.next();
//             });
//         }, function () {
//             callback(null, commentsResult);
//         });

//     });
// }


router.get('/comment/get', function (req, res, next) {
    var idBlog = req.query.id;
    var idUser = req.query.iduser;
    // res.json('aa')
    Blog.getComment(idBlog, function (err, result) {
        if (err) return res.json('Err');
        // console.log(result)
        async.map(result, function (item, callback) {
            // console.log(item._id)            
            if (item.votes.includes(idUser)) {
                var is_like = true;
            } else {
                var is_like = false;
            }
            var results = {
                _id: item._id,
                user: item.user,
                content: item.content,
                time: item.time,
                is_vote: is_like,
                votes: item.votes.length
            };
            callback(null, results)
        }, function (err, results) {
            return res.json(results);
        })

    })
})

router.post('/comment/like/add', function (req, res, next) {
    let idBlog = req.body.idblog
    let idComment = req.body.idcomment
    let idUser = req.body.iduser
    Blog.addLikeComment(idBlog, idComment, idUser, function (err, result) {
        if (err) res.json("Err")
        res.json("Done")
    })

})

router.post('/comment/like/remove', function (req, res, next) {
    let idBlog = req.body.idblog
    let idComment = req.body.idcomment
    let idUser = req.body.iduser
    // res.json(idComment)
    Blog.removeLikeComment(idBlog, idComment, idUser, function (err, result) {
        if (err) res.json("Err")
        res.json("Done")
    })

})

// router.post('/comment/reply/create', function (req, res, next) {
//     var idBlog = req.body.blog_id;
//     var idComment = req.body.id_comment;
//     // console.log(idComment);
//     var reply = {
//         user_id: "kfslkdfja",
//         content: 'abcfasd',
//         time: '12/2/2034',
//         votes: []
//     }
//     Blog.createReply(idBlog, idComment, reply, function (err, result) {
//         if (err) return res.json(err);
//         res.json(result);
//     });
// });

module.exports = router;