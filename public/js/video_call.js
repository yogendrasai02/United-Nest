import { endpoints } from './api_endpoints.js';
import { makeAPICall } from './make_api_call.js';
import { showToast } from './toasts.js';

// let accessToken = null;
let videoContainer = null;
let muteUnmuteAudioButton = null;
let muteUnmuteVideoButton = null;
let leaveVideoCallButton = null;
let roomObj = null;
let audioOn = true, videoOn = true;

const joinVideoRoom = async (roomName, token) => {
    // join the video room with the Access Token and the given room name
    const room = await Twilio.Video.connect(token, {
      room: roomName,
    });
    return room;
};

const handleTrackPublication = (trackPublication, participant) => {
    function displayTrack(track) {
        // append this track to the participant's div and render it on the page
        const participantDiv = document.getElementById(participant.identity);
        // track.attach creates an HTMLVideoElement or HTMLAudioElement
        // (depending on the type of track) and adds the video or audio stream
        participantDiv.append(track.attach());
    }
    // check if the trackPublication contains a `track` attribute. If it does,
    // we are subscribed to this track. If not, we are not subscribed.
    if (trackPublication.track) {
        displayTrack(trackPublication.track);
    }

    // listen for any new subscriptions to this track publication
    trackPublication.on("subscribed", displayTrack);
};

const handleConnectedParticipant = (participant) => {
    // create a div for this participant's tracks
    const participantDiv = document.createElement('div');
    console.log(participant.identity);
    participantDiv.setAttribute("id", participant.identity);
    participantDiv.classList.add('participant-video-container');

    const p = document.createElement('p');
    p.textContent = participant.identity;
    p.classList.add('participant-name', 'fs-4');
    participantDiv.appendChild(p);

    videoContainer.appendChild(participantDiv);

    // iterate through the participant's published tracks and
    // call `handleTrackPublication` on them
    console.log("participant: ", participant);
    participant.tracks.forEach((trackPublication) => {
        console.log("trackPublication: ", trackPublication);
        handleTrackPublication(trackPublication, participant);
    });

    // listen for any new track publications
    participant.on("trackPublished", handleTrackPublication);
};

const handleDisconnectedParticipant = (participant) => {
    // stop listening for this participant
    participant.removeAllListeners();
    // remove this participant's div from the page
    const participantDiv = document.getElementById(participant.identity);
    participantDiv.remove();
};

// ** Functions to toggle audio & video **

const toggleAudio = () => {
    console.log('Local Participant Toggle AUDIO');
    console.log('Is AUDIO ON?:', audioOn);

    if(audioOn) {
        // disable audio
        roomObj.localParticipant.audioTracks.forEach(track => {
            console.log(track);
            track.track.disable();
        });
    } else {
        // enable audio
        roomObj.localParticipant.audioTracks.forEach(track => {
            console.log(track);
            track.track.enable();
        });
    }

    audioOn = !audioOn;
    let icon = '<i class="ph-microphone-fill icon-3"></i>';
    if(!audioOn)    icon = '<i class="ph-microphone-slash-fill icon-3"></i>';
    muteUnmuteAudioButton.innerHTML = icon;
    console.log('After TOGGLE, Is AUDIO ON?:', audioOn);
};

const toggleVideo = () => {
    console.log('Local Participant Toggle VIDEO');
    console.log('Is VIDEO ON?:', videoOn);

    if(videoOn) {
        // disable video
        roomObj.localParticipant.videoTracks.forEach(track => {
            console.log(track);
            track.track.disable();
        });
    } else {
        // enable video
        roomObj.localParticipant.videoTracks.forEach(track => {
            console.log(track);
            track.track.enable();
        });
    }
    

    videoOn = !videoOn;
    let icon = '<i class="ph-video-camera-fill icon-3"></i>';
    if(!videoOn)    icon = '<i class="ph-video-camera-slash-fill icon-3"></i>';
    muteUnmuteVideoButton.innerHTML = icon;
    console.log('After TOGGLE, Is VIDEO ON?:', videoOn);
};


const startRoom = async (e) => {

    videoContainer = document.getElementById('video-container');
    muteUnmuteAudioButton = document.querySelector('#mute-unmute-audio-button');
    muteUnmuteVideoButton = document.querySelector('#mute-unmute-video-button');

    muteUnmuteAudioButton.disabled = true;
    muteUnmuteVideoButton.disabled = true;

    leaveVideoCallButton = document.querySelector('#leave-button');

    // 1. get username of receiver
    const username_receiver = document.getElementById('username_receiver').dataset.username_receiver;
    // 2. get access token for the room
    const res = await makeAPICall(
        endpoints.joinVideoCall.url,
        endpoints.joinVideoCall.method,
        { username_receiver }
    );
    if(!(res.status && res.status === 'success')) {
        showToast(res.status || 'error', res.message + '.Redirecting you to the lobby...');
        setTimeout(() => {
            location.assign('/video-call-lobby');
        }, 4 * 1000);
    }
    const token = res.videoCallAccessToken;
    const roomName = res.roomName;
    // 3. join the video room with the token
    const room = await joinVideoRoom(roomName, token);
    roomObj = room;

    muteUnmuteAudioButton.disabled = false;
    muteUnmuteVideoButton.disabled = false;

    // 4. render the local and remote participants' video and audio tracks
    handleConnectedParticipant(room.localParticipant);
    room.participants.forEach(handleConnectedParticipant);
    room.on('participantConnected', handleConnectedParticipant);

    muteUnmuteAudioButton.addEventListener('click', e => {
        toggleAudio();
    });
    muteUnmuteVideoButton.addEventListener('click', e => {
        toggleVideo();
    });

    leaveVideoCallButton.addEventListener('click', e => {
        location.assign('/video-call-lobby');
    });

    // 5. handle cleanup when a participant disconnects
    room.on("participantDisconnected", handleDisconnectedParticipant);
    window.addEventListener("pagehide", () => room.disconnect());
    window.addEventListener("beforeunload", () => room.disconnect());
};

window.onload = startRoom;