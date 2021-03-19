var socket = io.connect(window.location.hostname);

const myPeer = new Peer(undefined,{
    host: location.hostname,
    port: 443,
    secure: true,
    path:'/peerjs'
});

var users = {};
var host = {};
var me = 'check';

myPeer.on("open", id=>{
    socket.emit("user-joined", room, id);
});

const chatdiv = document.getElementsByClassName("message-window")[0];

socket.on("username", name=>{
    appendMessage(name);
    me = name;
});

socket.on("host-username", name=>{
    me = name;
});

document.getElementsByClassName("vid")[0].style.backgroundColor = '#ccc';
document.getElementsByClassName("mic")[0].style.backgroundColor = '#ccc';

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

        if(users[userId] != null){
            users[userId] = me;
        } else {
            host[userId] = me;
        }
        
        connectToNewUser(userId, stream);
    });

    function videoToggle(){
        stream.getVideoTracks()[0].enabled = !(stream.getVideoTracks()[0].enabled);
    }

    document.getElementsByClassName("mic")[0].addEventListener("click", (e)=>{
        if(document.getElementsByClassName("mic")[0].style.backgroundColor == '#ccc'){
            document.getElementsByClassName("mic")[0].style.backgroundColor = 'rgba(235, 64, 52,0.5)';
        } else {
            document.getElementsByClassName("mic")[0].style.backgroundColor = '#ccc'
        }
        micToggle();
    });

    function micToggle(){
        stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);
    }

    document.getElementsByClassName("vid")[0].addEventListener("click", (e)=>{
        if(document.getElementsByClassName("vid")[0].style.backgroundColor == '#ccc'){
            document.getElementsByClassName("vid")[0].style.backgroundColor = 'rgba(235, 64, 52,0.5)';
        } else {
            document.getElementsByClassName("vid")[0].style.backgroundColor = '#ccc'
        }
        videoToggle();
    });
});

socket.on("user-disconnected", userId =>{
    if(peers[userId]){
        peers[userId].close();
    };

    if(users[userId] != null){
        appendDisMessage(users[userId]);
    } else {
        appendDisMessage(host[userId]);
    }
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

        shouldScroll = chatdiv.scrollTop + chatdiv.clientHeight === chatdiv.scrollHeight;

        appendmyMessage(message);
        document.getElementsByTagName("input")[0].value = '';

        if (!shouldScroll) {
            scrollToBottom();
        }

        socket.emit("user-message", {message: message, room: room});
    }
});

scrollToBottom();

function scrollToBottom(){
    chatdiv.scrollTop = chatdiv.scrollHeight;
}

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









