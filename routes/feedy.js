var express = require('express')
var router = express.Router()

var fs = require('fs')
var multer = require('multer');
var uploads = multer({ dest: './uploads/feedys' });

var FeedyUser = require('../models/feedy_user_db')

const URL_SERVER = require('../models/url_server');


var request = require('request')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var downloadImage = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
router.post('/postbyurl', function (req, res, next) {
    var url = req.body.url
    var user = {
        user_id: req.body.user_id,
        user_name: req.body.user_name,
        user_image: req.body.user_image
    }
    request(url, function (err, response, body) {
        if (err) {

            res.json("Err")
        } else {
            const dom = new JSDOM(body)
            var image_feedy_dom = dom.window.document.getElementsByClassName("example-image-link")
            let image_feedy_url = image_feedy_dom[0].getAttribute('href')
            let image_feedy = image_feedy_url.replace(/\//g, '')
            image_feedy = image_feedy.replace(/\:/g, '')
            image_feedy = image_feedy.replace(/\%/g, '')
            downloadImage(image_feedy_url, './uploads/feedys/' + image_feedy, function (err, results) {
                console.log('done');
            })
            let image_feedy_main = '/feedy/getimage?id=' + image_feedy


            var content_chitiet = dom.window.document.getElementsByClassName("chitiet_content")[0]
            let name_feedy = content_chitiet.getElementsByTagName('h4')[0].textContent
            let intro_feedy = content_chitiet.getElementsByTagName('p')[1].textContent

            var center_chitiet = dom.window.document.getElementsByClassName("chitiet_center")[0]
            let time_prepare = center_chitiet.getElementsByTagName('td')[0].textContent
            let time_making = center_chitiet.getElementsByTagName('td')[1].textContent
            let level = center_chitiet.getElementsByTagName('td')[3].textContent


            let list_nguyenlieu = dom.window.document.getElementsByClassName("list_nguyenlieu")
            let list_nguyenlieu_length = list_nguyenlieu.length
            let prepare = []
            for (let i = 0; i < list_nguyenlieu_length; i++) {
                let prepare_content = list_nguyenlieu[i].getElementsByTagName('p')[0].textContent
                prepare_content = prepare_content.substring(prepare_content.indexOf('-') + 2, prepare_content.indexOf(':'))
                let prepare_temp = list_nguyenlieu[i].getElementsByTagName('span')[0].textContent.split(' ')
                let prepare_quantity = prepare_temp[0]
                let prepare_unit = prepare_temp[1]

                prepare.push({
                    prepare_content: prepare_content,
                    prepare_quantity: prepare_quantity,
                    prepare_unit: prepare_unit
                })
            }
            let making = []
            let phan_noi_dung_mot_buoc = dom.window.document.getElementsByClassName("phan-noi-dung-mot-buoc")
            let phan_noi_dung_mot_buoc_length = phan_noi_dung_mot_buoc.length
            for (let i = 0; i < phan_noi_dung_mot_buoc_length; i++) {
                let making_content = phan_noi_dung_mot_buoc[i].getElementsByTagName('p')[0].textContent
                let making_image = phan_noi_dung_mot_buoc[i].getElementsByTagName('img')[0].getAttribute('src')
                let image_feedy_makind = making_image.replace(/\//g, '')
                image_feedy_makind = image_feedy_makind.replace(/\:/g, '')
                image_feedy_makind = image_feedy_makind.replace(/\%/g, '')
                downloadImage(making_image, './uploads/feedys/' + image_feedy_makind, function (err, results) {
                    console.log('done');
                })
                let image_feedy_making_main = '/feedy/getimage?id=' + image_feedy_makind
                making.push({
                    content: making_content,
                    images: '/feedy/getimage?id=' + image_feedy_makind
                })
            }

            let feedyUserMain = {
                user: user,
                name_feedy: name_feedy,
                image_feedy: image_feedy_main,
                intro_feedy: intro_feedy,
                valuation_feedy: [],
                time_prepare: time_prepare,
                time_making: time_making,
                level: level,
                making: making,
                prepare: prepare,
                time: '23-5-2017'
            }

            // console.log(feedyUserMain)
            FeedyUser.createFeedyUser(feedyUserMain, function (err, result) {
                if (err) {
                    res.json("Err")
                    return
                }
                res.json("done")
            })


            // console.log()
            // res.json(level)
        }
    })
})

// router.get('/createnotifi',function(req,res,next){
//     res.render('notifi')
// })

router.post('/feedyuser', uploads.any(), function (req, res, next) {
    var files = req.files;
    // console.log(files)
    var feedyUser = req.body;
    // console.log(feedyUser)
    var making = []
    let user = {
        user_id: feedyUser.user_id,
        user_name: feedyUser.user_name,
        user_image: feedyUser.user_image
    }
    let prepare = []
    // console.log(prepare_content[0])
    for (let i = 0; i < feedyUser.prepare_content.length; i++) {
        prepare.push({
            prepare_content: feedyUser.prepare_content[i],
            prepare_quantity: feedyUser.prepare_quantity[i],
            prepare_unit: feedyUser.prepare_unit[i]
        })
    }
    if (files) {
        for (let file in files) {
            if (files[file].fieldname == 'image_feedy') {
                var image_feedy = '/feedy/getimage?id=' + files[file].filename
            } else {
                let stringNameFile = files[file].fieldname
                let count = stringNameFile.charAt(stringNameFile.length - 2)
                // console.log(string)
                let makingTemp = {
                    content: feedyUser.content_making[count],
                    images: '/feedy/getimage?id=' + files[file].filename
                }
                making.push(makingTemp)
            }
        }
        // console.log(image_feedy)
        let feedyUserMain = {
            user: user,
            name_feedy: feedyUser.name_feedy,
            image_feedy: image_feedy,
            intro_feedy: feedyUser.intro_feedy,
            valuation_feedy: [],
            time_prepare: feedyUser.time_prepare,
            time_making: feedyUser.time_making,
            level: feedyUser.level,
            making: making,
            prepare: prepare,
            time: feedyUser.time
        }

        // console.log(feedyUserMain)
        FeedyUser.createFeedyUser(feedyUserMain, function (err, result) {
            if (err) {
                res.json("Err")
                return
            }
            res.json("done")
        })

    }

})

router.get('/getimage', function (req, res, next) {
    var idImage = req.param('id');
    // console.log(id);
    var urlImage = 'uploads/feedys/' + idImage;
    // console.log(urlImage);
    var image = fs.readFileSync(urlImage);
    res.end(image, 'binary');
});

router.get('/feedyuser/:page', function (req, res, next) {
    FeedyUser.getFeedyUser(req.params.page, (err, results) => {
        if (err) {
            res.json({
                result: 'err',
                message: err
            })
            return
        }
        res.json({
            result: 'done',
            message: results
        })
    })
})

router.get('/getfeedyuser/:id', function (req, res, next) {
    let idFeedy = req.params.id;
    FeedyUser.getContentFeedyUser(idFeedy, function (err, results) {
        if (err) {
            res.json({
                result: 'err',
                message: err
            })
            return
        }
        res.json({
            result: 'done',
            message: results
        })
    })
})

router.get('/getfeedyofuser/:iduser/:page', function (req, res, next) {
    let idUser = req.params.iduser;
    let page = req.params.page;
    FeedyUser.getListFeedyByIdUser(idUser, page, function (err, results) {
        if (err) {
            res.json({
                result: 'err',
                message: err
            })
            return
        }
        res.json({
            result: 'done',
            message: results
        })
    })
})

router.post('/addvaluation/', function (req, res, next) {

    FeedyUser.addStarByUser(req.body.id_feedy, req.body.id_user, req.body.star, function (err, results) {
        if (err) res.json("Err")
        res.json("Done")
    })
})

router.delete('/feedy/:id', function (req, res, next) {
    let idFeedy = req.params.id;
    FeedyUser.deleteFeedyById(idFeedy, function (err, results) {
        if (err) {
            res.json({
                result: 'err',
                message: err
            })
            return
        }
        res.json({
            result: 'done',
            message: results
        })
    })
})


module.exports = router