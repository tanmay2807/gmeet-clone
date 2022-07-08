var socket = io.connect(window.location.hostname);
// var socket  = io.connect();

const myPeer = new Peer(undefined,{
    host: location.hostname,
    port: 443,
    // port: 3001,
    secure: true,
    // path:'/'
    path: '/peerjs'
});

myPeer.on('open', id=>{
    socket.emit("user-joined", room, id); // emitting as soon as we enter the room
});
//peerjs --port 3001 (peer js server intitialize)

socket.on("username", name=>{
    appendConnectMessage(name,"connected");
});

var myvideo = document.getElementsByClassName("video-me")[0]; // our video element
var videoElement = document.getElementById("vid"); // vid button
var chatdiv = document.getElementsByClassName("message-window")[0]; // messaging window
var micElemenet = document.getElementById("mic"); // mic button
myvideo.muted = true; // to not hear out ouwn voice

const peers = {}; // peers connected to us in our room

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    addVideoStream(myvideo, stream); // adding our own video on our screen

    myPeer.on('call', call =>{
        call.answer(stream); // for accepting the call of other's media stream
        const video = document.getElementsByClassName("video-you")[0];
        call.on('stream', userVideoStream =>{ 
            addVideoStream(video, userVideoStream); 
        });
    });

    socket.on("user-connected", userId=>{        
        connectToNewUser(userId, stream); // userId and stream are not of the same person (basically to transfer media stream)
    });

    // for toggling mic button 
    micElemenet.addEventListener("click", ()=>{
        if (micElemenet.className != 'button') {
            micElemenet.className = 'button';
        }else {
            micElemenet.className = 'mic';
        }
        micToggle();
    });

    // for toggling vid button
    videoElement.addEventListener("click", ()=>{
        if (videoElement.className != 'button') {
            videoElement.className = 'button';
        }else {
            videoElement.className = 'vid';
        }
        videoToggle();
    });

    function micToggle(){
        stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);
    }

    function videoToggle(){
        stream.getVideoTracks()[0].enabled = !(stream.getVideoTracks()[0].enabled);
    }
});

socket.on("user-disconnected", (userId ,leavename)=>{
    if(peers[userId]){
        peers[userId].close();
    };

    appendConnectMessage(leavename,"disconnected");
});

function connectToNewUser(userId, stream){ // for intilializing media calls to other person in the room 
    const call = myPeer.call(userId, stream); // making call to send our stream to the other perosn
    const video = document.getElementsByClassName("video-you")[0];

    call.on('stream', (userVideoStream) =>{
        addVideoStream(video, userVideoStream);
    });
    
    call.on('close', ()=>{
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream){// to add video in html
    video.srcObject = stream
    video.addEventListener("loadedmetadata", ()=>{
        video.play()
    });
}

socket.on("chat-message", data=>{
    appendMessage(data,"othermessage");
});

/// peerjs done now below is the code for dom js ///

(function joined(){
    var newElement = document.createElement('div');
    newElement.innerHTML = `You joined`;
    newElement.classList.add('connected');
    document.getElementsByClassName("message-window")[0].appendChild(newElement);
})();

var form = document.getElementsByClassName("message-form")[0];

form.addEventListener("submit", (e)=>{ // sending messages
    e.preventDefault();
    var message = document.getElementsByTagName("input")[0].value;
    if(message == ''){
        document.getElementsByTagName("button")[0].disabled = true;
    } else {
        document.getElementsByTagName("button")[0].disabled = false;
        appendMessage(message,"mymessage");
        document.getElementsByTagName("input")[0].value = '';
        socket.emit("user-message", {message: message, room: room});
    }
});

function appendConnectMessage(message,type){ // connectivity message
    var newElement = document.createElement("div");
    newElement.innerHTML = `${message} got ${type}`;
    var connectedMessage = document.getElementsByClassName("message-window")[0].appendChild(newElement);
    connectedMessage.classList.add("connected");
};

function appendMessage(message,classname){ // chat messages
    shouldScroll = chatdiv.scrollTop + chatdiv.clientHeight === chatdiv.scrollHeight;
    if (!shouldScroll) {
        chatdiv.scrollTop = chatdiv.scrollHeight+100;
    }
    var newElement = document.createElement("div");
    newElement.innerHTML = `${message}`;
    var connectedMessage = document.getElementsByClassName("message-window")[0].appendChild(newElement);
    connectedMessage.classList.add(`${classname}`);
};

///// form styling below /////

document.getElementsByTagName("i")[3].style.color = "#777";

document.getElementsByTagName("input")[0].addEventListener("keyup", ()=>{
    if(document.getElementsByTagName("input")[0].value == ''){
        document.getElementsByTagName("i")[3].style.color = "#777";
    } else {
        document.getElementsByTagName("i")[3].style.color = "#222";
    }
});

document.getElementsByClassName("close")[0].addEventListener("click", (e)=>{ // room code pop up
    document.getElementsByClassName("room-info")[0].style.display = "none";
})









