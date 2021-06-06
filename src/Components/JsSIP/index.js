import JsSIP from 'jssip'

const socket = new JsSIP.WebSocketInterface('wss://sbc03.tel4vn.com:7444');

const eventHandlers = {
    'progress': function (e) {
        console.log('call is in progress' + e);
    },
    'failed': function (e) {
        console.log('call failed with cause: ' + e);
    },
    'ended': function (e) {
        console.log('call ended with cause: ' + e);
    },
    'confirmed': function (e) {
        console.log('call confirmed' + e);
    }
};

export const configuration = {
    sockets: [socket],
    uri: '105@2-test1.gcalls.vn:50061',
    password: 'test1105'
};

export const options = {
    'eventHandlers': eventHandlers,
    'mediaConstraints': { 'audio': true, 'video': true }
};

