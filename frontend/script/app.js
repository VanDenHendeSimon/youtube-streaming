"use strict";

const lanIP = `${window.location.hostname}:5000`;
const socketio = io(lanIP);
const endPoint = `http://${lanIP}/api/v1`;
let video, containerWidth, duration;
let screenWidth, screenHeight;

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
    try {
        player = new YT.Player("player", {
            height: `${screenHeight}`,
            width: `${screenWidth}`,
            videoId: video,
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
    }   catch {
        document.querySelector('#player').innerHTML = "Could not find video";
    }
}

function onPlayerReady(event) {
    // 4. The API will call this function when the video player is ready.
    event.target.playVideo();
    fillTimeTags();
    setPartyName();
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

const pxToInt = function(number) {
    return parseInt(number.replace('px', ''));
}

// Every 0.5 seconds
var update_loop = setInterval(animateSlider, 500);
animateSlider();

function animateSlider() {
    try {
        const currentTime = player.getCurrentTime();
        document.querySelector('.current-time').innerHTML = formatSeconds(currentTime);
        
        const slider = document.querySelector('.slider');
        const sliderStyle = getComputedStyle(slider);
        slider.style.setProperty('margin-left', `${currentTime / duration * (containerWidth - pxToInt(sliderStyle.width))}px`);

    } catch {}
}

const clickedPlay = function (currentTime) {
    socketio.emit("F2B_play", { time: currentTime });
};

const clickedPause = function (currentTime) {
    socketio.emit("F2B_pause", { time: currentTime });
};

const listenToUI = function () {
    for (const button of document.querySelectorAll(".c-button")) {
        button.addEventListener("click", function () {
            const currentTime = player.getCurrentTime();

            const action = this.getAttribute("id");
            action === "btn-play"
                ? clickedPlay(currentTime)
                : clickedPause(currentTime);
        });
    }
};

const listenToSocket = function () {
    socketio.on("connection_recieved", function (payload) {
        console.log(payload);
    });

    socketio.on("pause-video", function (payload) {
        player.seekTo(payload.time);
        player.pauseVideo();
    });

    socketio.on("play-video", function (payload) {
        player.seekTo(payload.time);
        player.playVideo();
    });

    socketio.on('B2F_ClientCount', function(payload) {
        const partyName = document.querySelector('.lobby').getAttribute('data-party-name');
        document.querySelector('.lobby').querySelector('p').innerHTML = `Welcome to the party!</br>${partyName} - ${payload.count} people are listening`;
    })
};

const formatSeconds = function (timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60).toString();
    const secons = Math.floor(timeInSeconds % 60).toString();

    return `${minutes.padStart(2, '0')}:${secons.padStart(2, '0')}`;
};

const fillTimeTags = function () {
    const tags = document.querySelector(".time-tags");
    duration = player.getDuration();

    tags.innerHTML = '<p class="current-time">00:00</p>';
    tags.innerHTML += `<p>${formatSeconds(duration)}</p>`;
};

const setDimensions = function() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight * 0.7;

    try {
        const iFramePlayer = document.querySelector('#player');
        iFramePlayer.setAttribute('width', screenWidth);
        iFramePlayer.setAttribute('height', screenHeight);
    }   catch {}
}

const setPartyName = function() {
    const path = window.location.pathname;
    const partyName = path.substring(
        path.lastIndexOf("/") + 1, 
        path.lastIndexOf(".")
    );

    socketio.emit('F2B_ClientCount', { partyName: `${partyName}.html` });
}

const init = function () {
    console.log("dom content loaded");
    
    const queryString = new URLSearchParams(window.location.search);
    if (queryString.has('v')) {
        video = queryString.get('v');
    }

    setDimensions();
    loadIFramePlayer();
    listenToUI();
    listenToSocket();

    const container = document.querySelector('.controls');
    const style = getComputedStyle(container);
    containerWidth = pxToInt(style.width);
};

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", setDimensions)
