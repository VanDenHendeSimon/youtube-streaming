"use strict";

const lanIP = `${window.location.hostname}:5000`;
const socketio = io(lanIP);
const endPoint = `http://${lanIP}/api/v1`;

const loadIFramePlayer = function () {
    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement("script");

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};

let player;
function onYouTubeIframeAPIReady() {
    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    player = new YT.Player("player", {
        height: "480",
        width: "700",
        videoId: "FGBhQbmPwH8",
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
        },
        playerVars: {
            controls: 0,
            autoplay: 0,
            disablekb: 1,
            fs: 1,
        },
    });
}

function onPlayerReady(event) {
    // 4. The API will call this function when the video player is ready.
    event.target.playVideo();
}

var done = false;
function onPlayerStateChange(event) {
    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(stopVideo, 6000);
        done = true;
    }
}

function stopVideo() {
    player.stopVideo();
}

const listenToUI = function () {
    console.log("listening to buttons & shit");
};

const listenToSocket = function () {
    socketio.on("connection_recieved", function (payload) {
        console.log(payload);
    });
};

const init = function () {
    console.log("dom content loaded");

    loadIFramePlayer();
    listenToUI();
    listenToSocket();
};

document.addEventListener("DOMContentLoaded", init);
