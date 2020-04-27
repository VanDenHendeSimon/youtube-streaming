"use strict";

const lanIP = `${window.location.hostname}:5000`;
const endPoint = `http://${lanIP}/api/v1`;
let createBtn, joinBtn, inputText;

const joinedParty = function(jsonObject) {
    if (jsonObject.in_progress) {
        // use window.location.replace() to hide this from the browser history
        // not quite handy here bcus then we can't go back to the index.html easily
        window.location.href = jsonObject.url;
    }   else {
        console.log('Party does not yet exist. Do you want to create it?');
    }
}

const createdParty = function(jsonObject){
    if (jsonObject.in_progress) {
        console.log('Party does already exist. Do you want to join it?');
    }   else {
        // use window.location.replace() to hide this from the browser history
        // not quite handy here bcus then we can't go back to the index.html easily
        window.location.href = jsonObject.url;
    }
}

const addEventListeners = function() {
    createBtn.addEventListener('click', function() {
        handleData(`${endPoint}/create/${inputText.value}`, createdParty, partyFailed);
    })
    
    joinBtn.addEventListener('click', function() {
        handleData(`${endPoint}/join/${inputText.value}`, joinedParty, partyFailed);
    })
}

const partyFailed = function(e) {
    console.log(e);
}

const init = function() {
    createBtn = document.querySelector('#btn-create');
    joinBtn = document.querySelector('#btn-join');

    inputText = document.querySelector('#lobbyIdInputField');

    addEventListeners();
}

document.addEventListener('DOMContentLoaded', init);