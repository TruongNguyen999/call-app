import './css/style.css';
import { FaPhone, FaMicrophone } from 'react-icons/fa';
import { useState } from 'react'
import JsSIP from 'jssip'
import * as jssip from './JsSIP/index'

const padding = {
    padding: '10px'
}

const App = () => {

    const [number, setNumber] = useState('')
    const [incomingCall, setIncomingCall] = useState('none')
    const [callControl , setCallControl] = useState('block')
    const [callStatus, setCallStatus] = useState('none')
    const [inCallButtons, setInCallButtons] = useState('block')
    const [callInfoText, setCallInfoText] = useState('info text goes here')
    const [callInfoNumber, setCallInfoNumber] = useState('info number goes here')
    const [incomingCallNumber, setIncomingCallNumber] = useState('block')

    let session
    let phone
    const incomingCallAudio = new window.Audio('https://code.bandwidth.com/media/incoming_alert.mp3');
    incomingCallAudio.loop = true;
    const remoteAudio = new window.Audio();
    remoteAudio.autoplay = true;

    const Connect = () => {
        if (jssip.configuration.uri && jssip.configuration.password) {
            JsSIP.debug.enable('JsSIP:*');
            phone = new JsSIP.UA(jssip.configuration);
            phone.on('registrationFailed', function (ev) {
                alert('Registering on SIP server failed with error: ' + ev.cause);
                jssip.configuration.uri = null;
                jssip.configuration.password = null;
                UpdateUI();
            });
            phone.on('newRTCSession', function (ev) {
                var newSession = ev.session;
                if (session) { // hangup any existing call
                    session.terminate();
                }
                session = newSession;
                var completeSession = function () {
                    session = null;
                    UpdateUI();
                };
                session.on('ended', completeSession);
                session.on('failed', completeSession);
                session.on('accepted', UpdateUI);
                session.on('confirmed', function () {
                    var localStream = session.connection.getLocalStreams()[0];
                    var dtmfSender = session.connection.createDTMFSender(localStream.getAudioTracks()[0])
                    session.sendDTMF = function (tone) {
                        dtmfSender.insertDTMF(tone);
                    };
                    UpdateUI();
                });
                session.on('addstream', function (e) {
                    incomingCallAudio.pause();
                    remoteAudio.src = window.URL.createObjectURL(e.stream);
                });
                if (session.direction === 'incoming') {
                    incomingCallAudio.play();
                }
                UpdateUI();
            });
            phone.start();
        }
    }

    const UpdateUI = () => {
        if (jssip.configuration.uri && jssip.configuration.password) {
            if (session) {
                if (session.isInProgress()) {
                    if (session.direction === 'incoming') {
                        setIncomingCallNumber(session.remote_identity.uri)
                        // setIncomingCallNumber('none')
                        setIncomingCall('block')
                        setCallControl('none')
                    } else {
                        setCallInfoText('Ringing...')
                        setCallInfoNumber(session.remote_identity.uri.user);
                        setCallStatus('block')
                    }

                } else if (session.isEstablished()) {
                    setCallStatus('block')
                    setIncomingCall('none')
                    setInCallButtons('block')
                    setCallInfoText('In Call');
                    setCallInfoNumber(session.remote_identity.uri.user);
                    incomingCallAudio.pause();
                }
                setCallControl('none')
            } else {
                setIncomingCall('none')
                setCallControl('block')
                setCallStatus('none')
                incomingCallAudio.pause();
            }
        }
    }

    const Call = () => {
        Connect()
        phone.call(number, jssip.options);
        UpdateUI()
    }

    return (
        <div id="wrapper">
            <div id="incomingCall" style={{ display: incomingCall }}>
                <div className="callInfo">
                    <h3>Incoming Call</h3>
                    <p id="incomingCallNumber" style={{ display: incomingCallNumber }}>
                        {incomingCallNumber}
                    </p>
                </div>
                <div id="answer"><FaPhone style={padding} /></div>
                <div id="reject"><FaPhone style={padding} /></div>
            </div>
            <div id="callStatus" style={{ display: callStatus }}>
                <div className="callInfo">
                    <h3 id="callInfoText">
                        {callInfoText}
                    </h3>
                    {/* <h3 id="ringing" style={{ display: ringing }}>Ringing...</h3> */}
                    <p id="callInfoNumber">
                        {callInfoNumber}
                    </p>
                </div>
                <div id="hangUp"> <FaPhone style={padding} />
                </div>
            </div>
            <div id="inCallButtons" style={{ display: inCallButtons }}>
                <div id="dialPad">
                    <div className="dialpad-char" onClick={() => setNumber(number + '1')}>1</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '2')}>2</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '3')}>3</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '4')}>4</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '5')}>5</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '6')}>6</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '7')}>7</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '8')}>8</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '9')}>9</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '*')}>*</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '0')}>0</div>
                    <div className="dialpad-char" onClick={() => setNumber(number + '#')}>#</div>
                </div>
                <div id="mute">
                    <FaMicrophone style={padding} />
                </div>
            </div>

            <div id="callControl" style={{ display: callControl }}>
                <div id="to">
                    <input
                        id="toField"
                        type="text"
                        placeholder="Enter number here"
                        value={number}
                        onKeyPress={(e) => e.key === 'Enter' ? Call() : null}
                        onChange={(e) => setNumber(e.target.value)}
                    />
                </div>
                <div id="connectCall" onClick={() => number && Call()}>
                    <FaPhone style={padding} />
                </div>
            </div>
        </div>
    )
}

export default App