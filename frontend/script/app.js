"use strict";

const lanIP = `${window.location.hostname}:5000`;
const socketio = io(lanIP);
const endPoint = `http://${lanIP}/api/v1`;
let containerWidth, duration;
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
    player = new YT.Player("player", {
        height: `${screenHeight}`,
        width: `${screenWidth}`,
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
    fillTimeTags();
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

const init = function () {
    console.log("dom content loaded");

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
