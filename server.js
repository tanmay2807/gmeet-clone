const express = require('express');
const app = express();
const { ExpressPeerServer } = require('peer');
const PORT = process.env.PORT || 3000; // port
var server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});
const peerServer = ExpressPeerServer(server, {
    path: '/'
});
  
const io = require('socket.io')(server);
const bodyParser = require("body-parser"); 

app.use('/peerjs', peerServer);
app.use(express.static("static"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));

var roomInfo = {}; // room vs roomname || username || age || gender
var users = []; // id vs name

// host in
app.post("/", (req,res)=>{
    if(roomInfo[req.body.roomname]!=undefined) res.send("This room is already in use!");
    else roomInfo[req.body.roomname] = [[req.body.roomname,req.body.hostusername,req.body.hostage,req.body.gender]];
    
    res.redirect(req.body.roomname);
});

// user in
app.post("/chat", (req,res)=>{
    var info = req.body;

    if(roomInfo[info.roomcode]==undefined) res.send("Room doesn't exist");
    else if(roomInfo[info.roomcode].length==1){
        roomInfo[info.roomcode].push([info.roomcode,info.joinusername,info.userage,info.gender]);
        res.redirect(info.roomcode);
    }
    else res.send("Room is full");
});

io.on("connection", socket=>{
    socket.on("user-joined", (room, id)=>{
        socket.join(room);
        users[id] = roomInfo[room][roomInfo[room].length-1][1]; //adding user into users list
        socket.to(room).broadcast.emit("username",roomInfo[room][roomInfo[room].length-1][1]); // sending joining message to other user
        socket.to(room).broadcast.emit("user-connected", id); // making connection with the other user
        // if a user disconnects
        socket.on("disconnect", ()=>{
            socket.to(room).broadcast.emit("user-disconnected", id, users[id]);
            // deleting user from rooms list
            var deleteFromRoomList = roomInfo[room].indexOf(users[id]);
            roomInfo[room].splice(deleteFromRoomList,1);
            //deleting user from users list
            var deleteFromUserList = users.indexOf(users[id]);
            users.splice(deleteFromUserList,1);
            // if room is empty => delete room
            if(roomInfo[room].length==0){
                delete roomInfo[room];
            }
            socket.leave(room);
        });
    });
    
    socket.on("user-message", data=>{
        socket.to(data.room).broadcast.emit("chat-message", data.message);
    });
})

app.get("/:room", (req,res)=>{
    var roomMembers = roomInfo[req.params.room];
    if(roomMembers!=undefined){
        console.log(roomMembers);
        if(roomMembers.length <=2) res.render("room",{hostname:roomMembers[roomMembers.length-1][1],room: req.params.room});
    }else{
        res.redirect("/");
    }
});

app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/index.html");
});


