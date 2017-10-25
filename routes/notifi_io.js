module.exports = function (app, io) {
    app.post('/notifiall', function (req, res) {
        let title = req.body.title
        let content = req.body.content

        console.log(req.body)
        // let notifi = {
        //     title: title,
        //     content: content
        // }

        // io.sockets.emit('server_send_notifi', notifi);
        res.json("Đã gửi thông báo");

    });
}