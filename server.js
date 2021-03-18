const express = require('express')
const app = express();
// const { ExpressPeerServer } = require('peer');
const PORT = process.env.PORT || 3000; ////
var server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
}); ////
// const peerServer = ExpressPeerServer(server, {
//     path: '/'
// });
const io = require('socket.io')(server)

const bodyParser = require("body-parser");
// app.use('/peerjs', peerServer);
app.use(express.static("static"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));

var rooms = {};

app.post("/", (req,res)=>{

    rooms[req.body.roomname] = req.body.roomname;
    res.redirect(req.body.roomname);

    io.to(req.body.roomname).emit("username", req.body.hostusername);
});

app.post("/chat", (req,res)=>{

    if(rooms[req.body.roomcode] != null){
        res.redirect(req.body.roomcode);
    } else {
        res.redirect("/");
    };

    io.to(req.body.roomcode).emit("username", req.body.joinusername);
})

io.on("connection", socket=>{
    socket.on("user-joined", (room, id)=>{
        socket.join(room);
        socket.to(room).broadcast.emit("user-connected", id);

        socket.on("disconnect", ()=>{
            socket.to(room).broadcast.emit("user-disconnected", id);
        })
    });
    socket.on("user-message", data=>{
        socket.to(data.room).broadcast.emit("chat-message", data.message);
    });
})

app.get("/:room", (req,res)=>{
    res.render("room", {room: req.params.room});
});

app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/index.html");
});


