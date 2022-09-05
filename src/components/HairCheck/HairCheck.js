import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  useLocalParticipant,
  useVideoTrack,
  useDevices,
  useDaily,
  useDailyEvent,
} from '@daily-co/daily-react-hooks';
import UserMediaError from '../UserMediaError/UserMediaError';

import './HairCheck.css';

export default function HairCheck({ joinCall, cancelCall }) {
  const localParticipant = useLocalParticipant();
  const videoTrack = useVideoTrack(localParticipant?.session_id);
  const { microphones, speakers, cameras, setMicrophone, setCamera, setSpeaker } = useDevices();
  const callObject = useDaily();
  const videoElement = useRef();

  const [getUserMediaError, setGetUserMediaError] = useState(false);

  const [password, setPassword] = useState('');

  let getMeetingToken = async (owner) => {
    let response;
    try {
      response = await fetch(`https://api.daily.co/v1/meeting-tokens`, {
        method: 'POST',
        body: JSON.stringify({
          properties: {
            is_owner: owner == true ? true : false,
            // enable_recording: owner == true ? 'cloud' : null,
            enable_recording: 'cloud',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.REACT_APP_DAILY_API_KEY,
        },
      });
    } catch (error) {
      console.log(error);
    }
    const data = await response.json();
    return data;
  };

  useDailyEvent(
    'camera-error',
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );

  const onChange = (e) => {
    callObject.setUserName(e.target.value);
  };

  const join = async (e) => {
    e.preventDefault();
    let token;
    if (password === process.env.OWNER_LOGIN_PASSWORD) {
      token = await getMeetingToken(true);
    } else {
      token = await getMeetingToken(false);
    }
    joinCall(token);
  };

  useEffect(() => {
    if (!videoTrack.persistentTrack) return;
    videoElement?.current &&
      (videoElement.current.srcObject =
        videoTrack.persistentTrack && new MediaStream([videoTrack?.persistentTrack]));
  }, [videoTrack.persistentTrack]);

  const updateMicrophone = (e) => {
    setMicrophone(e.target.value);
  };

  const updateSpeakers = (e) => {
    setSpeaker(e.target.value);
  };

  const updateCamera = (e) => {
    setCamera(e.target.value);
  };

  return (
    <>
      {getUserMediaError ? (
        <UserMediaError />
      ) : (
        <form className="hair-check" onSubmit={join}>
          <h1>Setup your hardware</h1>
          {/*Video preview*/}
          {videoTrack?.persistentTrack && <video autoPlay muted playsInline ref={videoElement} />}

          {/*Username*/}
          <div>
            <label htmlFor="username">Your name:</label>
            <input
              name="username"
              type="text"
              placeholder="Enter username"
              onChange={(e) => onChange(e)}
              value={localParticipant?.user_name || ' '}
            />
          </div>

          <div>
            <label htmlFor="ownerPassword">Owner Login:</label>
            <input
              name="ownerPassword"
              type="password"
              placeholder="Enter password to enter as moderator"
              onChange={(e) => setPassword(e.target.value.trim())}
              value={password}
            />
          </div>

          {/*Microphone select*/}
          <div>
            <label htmlFor="micOptions">Microphone:</label>
            <select name="micOptions" id="micSelect" onChange={updateMicrophone}>
              {microphones?.map((mic) => (
                <option key={`mic-${mic.device.deviceId}`} value={mic.device.deviceId}>
                  {mic.device.label}
                </option>
              ))}
            </select>
          </div>

          {/*Speakers select*/}
          <div>
            <label htmlFor="speakersOptions">Speakers:</label>
            <select name="speakersOptions" id="speakersSelect" onChange={updateSpeakers}>
              {speakers?.map((speaker) => (
                <option key={`speaker-${speaker.device.deviceId}`} value={speaker.device.deviceId}>
                  {speaker.device.label}
                </option>
              ))}
            </select>
          </div>

          {/*Camera select*/}
          <div>
            <label htmlFor="cameraOptions">Camera:</label>
            <select name="cameraOptions" id="cameraSelect" onChange={updateCamera}>
              {cameras?.map((camera) => (
                <option key={`cam-${camera.device.deviceId}`} value={camera.device.deviceId}>
                  {camera.device.label}
                </option>
              ))}
            </select>
          </div>

          <button onClick={join} type="submit">
            Join call
          </button>
          <button onClick={cancelCall} className="cancel-call">
            Back to start
          </button>
        </form>
      )}
    </>
  );
}
