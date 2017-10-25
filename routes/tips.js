var express = require('express');
var router = express.Router();
var Tips = require('../models/tips_db')

var fs = require('fs');
var multer = require('multer');
var uploads = multer({ dest: './uploads/tips' });

var request = require('request')

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

router.post('/create', uploads.single('image'), function (req, res, next) {

    var urlImage = '/tips/getimage?id=';

    var profileImageName = urlImage + req.file.filename;
    // console.log(profileImageName)

    let url = req.body.url
    request(url, function (err, response, body) {
        if (err) {

            res.json("Err")
        } else {
            const dom = new JSDOM(body)

            var x = dom.window.document.querySelector('small')
            x.parentNode.removeChild(x)

            // var comments = dom.window.document.getElementsByClassName('fb-comments')
            // comments.parentNode.removeChild(comments)


            var f = dom.window.document.getElementsByClassName("blog-content");

            // var title = f.querySelector('h1')
            var title = dom.window.document.querySelector("h1").textContent

            var description = dom.window.document.querySelector("h3").textContent

            var center = f[0].getElementsByTagName('center')
            center[0].parentNode.removeChild(center[0])

            f[0].getElementsByTagName("iframe")[0].style.width = "100%"
            // f[0].getElementsByTagName("iframe")[0].removeAttribute("height")

            var image = f[0].getElementsByTagName("img")
            // [0].removeAttribute("width"); 

            for (let i = 0; i < image.length; i++) {
                f[0].getElementsByTagName("img")[i].removeAttribute("width")
                f[0].getElementsByTagName("img")[i].removeAttribute("height")
                f[0].getElementsByTagName("img")[i].removeAttribute("alt")
                f[0].getElementsByTagName("img")[i].style.width = "100%"
                // f[0].getElementsByTagName("img")[i].removeAttribute("width")
            }


            var tips = {
                title: title,
                image: profileImageName,
                description: description,
                tips: f[0].innerHTML
            }

            Tips.createTips(tips, function (err, results) {
                if (err) res.json(err)
                res.json("Done")
            })
        }
    })

})

router.get('/getimage', function (req, res, next) {
    var idImage = req.param('id');
    // console.log(id);
    var urlImage = 'uploads/tips/' + idImage;
    // console.log(urlImage);
    var image = fs.readFileSync(urlImage);
    res.end(image, 'binary');
});


router.get('/listtips/:page', function (req, res, next) {
    Tips.getListTips(req.params.page, function (err, results) {
        if (err) res.json(err)
        res.json(results)
    })
})

router.get('/gettips/:id', function (req, res, next) {
    let id = req.params.id
    // console.log(idUser)
    Tips.getTips(id, function (err, results) {
        if (err) res.json(err)
        res.render('tips', { content: results })
    })
})

module.exports = router