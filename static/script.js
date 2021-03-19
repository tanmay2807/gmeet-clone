var socket = io.connect(window.location.hostname);

const myPeer = new Peer(undefined,{
    host: location.hostname,
    port: 443,
    secure: true,
    path:'/peerjs'
});

var users = {};
var me = 'check';

myPeer.on("open", id=>{
    socket.emit("user-joined", room, id);
});

const chatdiv = document.getElementsByClassName("message-window")[0];

socket.on("username", name=>{
    chatdiv.scrollTop(chatdiv.style.height);
    appendMessage(name);
    me = name;
});

const myvideo = document.getElementsByClassName("video-me")[0];
myvideo.muted = true;

const peers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    addVideoStream(myvideo, stream);

    myPeer.on('call', call=>{
        call.answer(stream);
        const video = document.getElementsByClassName("video-you")[0];

        call.on('stream', userVideoStream =>{
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on("user-connected", userId=>{
        users[userId] = me;
        connectToNewUser(userId, stream);
    });

    function videoToggle(){
        stream.getVideoTracks()[0].enabled = !(stream.getVideoTracks()[0].enabled);
    }

    document.getElementsByClassName("mic")[0].addEventListener("click", (e)=>{
        document.getElementsByClassName("mic")[0].classList.toggle("button");
        micToggle();
    });

    function micToggle(){
        stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);
    }

    document.getElementsByClassName("vid")[0].addEventListener("click", (e)=>{
        document.getElementsByClassName("vid")[0].classList.toggle("button");
        videoToggle();
    });
});

socket.on("user-disconnected", userId =>{
    if(peers[userId]){
        peers[userId].close();
    }
    appendDisMessage(users[userId]);
});

function appendDisMessage(message){
    var newElement = document.createElement("div");
    newElement.innerHTML = `${message} got disconnected`;
    var connectedMessage = document.getElementsByClassName("message-window")[0].appendChild(newElement);
    connectedMessage.classList.add("connected");
};

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream); 
    const video = document.getElementsByClassName("video-you")[0];

    call.on('stream', (userVideoStream) =>{
        addVideoStream(video, userVideoStream);
    });
    
    call.on('close', ()=>{
        video.remove();
    });         

    peers[userId] = call;
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener("loadedmetadata", ()=>{
        video.play()
    });
}

/////socketio things//////////

(function joined(){
    var newElement = document.createElement('div');
    newElement.innerHTML = `You joined`;
    newElement.classList.add('connected');
    document.getElementsByClassName("message-window")[0].appendChild(newElement);
})();

function appendMessage(message){
    var newElement = document.createElement("div");
    newElement.innerHTML = `${message} got connected`;
    var connectedMessage = document.getElementsByClassName("message-window")[0].appendChild(newElement);
    connectedMessage.classList.add("connected");
};

function appendmyMessage(message){
    var newElement = document.createElement("div");
    newElement.innerHTML = `${message}`;
    var connectedMessage = document.getElementsByClassName("message-window")[0].appendChild(newElement);
    connectedMessage.classList.add("mymessage");
};

const form = document.getElementsByClassName("message-form")[0];

form.addEventListener("submit", (e)=>{
    e.preventDefault();

    var message = document.getElementsByTagName("input")[0].value;

    if(message == ''){
        document.getElementsByTagName("button")[0].disabled = true;
    } else {
        appendmyMessage(message);
        document.getElementsByTagName("input")[0].value = '';

        socket.emit("user-message", {message: message, room: room});
    }
});

socket.on("chat-message", data=>{
    appendotherMessage(data);
});

function appendotherMessage(message){
    var newElement = document.createElement("div");
    newElement.innerHTML = `${message}`;
    var connectedMessage = document.getElementsByClassName("message-window")[0].appendChild(newElement);
    connectedMessage.classList.add("othermessage");
};


///// form styling/////

document.getElementsByTagName("i")[3].style.color = "#777";

document.getElementsByTagName("input")[0].addEventListener("keyup", ()=>{
    if(document.getElementsByTagName("input")[0].value == ''){
        document.getElementsByTagName("i")[3].style.color = "#777";
    } else {
        document.getElementsByTagName("i")[3].style.color = "#222";
    }
});

document.getElementsByClassName("close")[0].addEventListener("click", (e)=>{
    document.getElementsByClassName("room-info")[0].style.display = "none";
})









