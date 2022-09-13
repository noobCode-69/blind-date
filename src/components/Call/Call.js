import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  useParticipantIds,
  useDaily,
  useLocalParticipant,
  useAppMessage,
  useDailyEvent,
  useReceiveSettings,
} from '@daily-co/daily-react-hooks';

import './Call.css';
import Tile from '../Tile/Tile';
import UserMediaError from '../UserMediaError/UserMediaError';


export default function Call() {
  /* If a participant runs into a getUserMedia() error, we need to warn them. */



  const [value , setValue] = useState(1);



  const [ownerSessionId, setOwnerSessionId] = useState(null);
  const callObject = useDaily();
  const [getUserMediaError, setGetUserMediaError] = useState(false);
  const isOwner = callObject._participants.local.owner;
  const [pinnedUser, setPinnedUser] = useState(null);

  let [userDetails , setUserDetails] = useState({});



  /* We can use the useDailyEvent() hook to listen for daily-js events. Here's a full list
   * of all events: https://docs.daily.co/reference/daily-js/events */

  useDailyEvent(
    'camera-error',
    useCallback((ev) => {
      setGetUserMediaError(true);
    }, []),
  );

  /* This is for displaying remote participants: this includes other humans, but also screen shares. */

  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });

  /* This is for displaying our self-view. */
  const localParticipant = useLocalParticipant();
  const isAlone = useMemo(() => remoteParticipantIds?.length < 1, [remoteParticipantIds]);

  const startRecording = async () => {
    await callObject.startRecording({
      backgroundColor: '#FF1F2D3D',
      layout: {
        preset: 'active-participant',
      },
    });
  };


  const sendAppMessage = useAppMessage({
      onAppMessage: useCallback((ev) => {

        setUserDetails(ev.data.userDetails)
        if(localParticipant.owner == true){
          return;
        }
        if (ev.data.type == 'SUBSCRIBE') {
          callObject.updateParticipant(ev.data.msg, {
            setSubscribedTracks: { audio: true, video: true, screenVideo: false },
          })
        }
        else if(ev.data.type == 'UNSUBSCRIBE'){
         callObject.updateParticipant(ev.data.msg, {
            setSubscribedTracks: { audio: true, video: false, screenVideo: false },
          })
        }
      }, []),
  });

  useEffect(() => {
    if (localParticipant == null || localParticipant == undefined || value >= 2) {
      return;
    }
    setValue(2);
    if (isOwner) {
      setOwnerSessionId(localParticipant.session_id);
      startRecording();
    }
    const newUserDetails = userDetails;
    newUserDetails[localParticipant.session_id] = false;
    setUserDetails(newUserDetails)
    callObject.updateParticipant('local', {
      setSubscribedTracks: { audio: false, video: true, screenVideo: false },
    });
  }, [localParticipant]);




  useEffect(() => {
    callObject.on('participant-joined', (user) => {


      const newUserDetails = userDetails;


      newUserDetails[user.participant.session_id] = false;
      setUserDetails(newUserDetails)

      if(user.participant.owner == true){
        setOwnerSessionId(user.participant.session_id);
      }
      if (localParticipant.owner) {
        callObject.updateParticipant(user.participant.session_id, {
          setSubscribedTracks: { audio: true, video: true, screenVideo: false },
        });
      } else {
        callObject.updateParticipant(user.participant.session_id, {
          setSubscribedTracks: { audio: true, video: false, screenVideo: false },
        });
      }
      onPin(user.participant.session_id);
    });
    callObject.on('participant-updated', (user) => {
      onPin(user.participant.session_id);
    });
  }, []);

  let onPin = (id) => {
    setPinnedUser(id);
  };

  let onUnpin = () => {
    setPinnedUser(null);
  };

  let copyRoomUrl = (roomUrl) => {
    navigator.clipboard.writeText(roomUrl);
  }

  const renderCallScreen = () => {
    if (isAlone) {
      return (
        <div className="call">
          <div className="pinned-user">
            {localParticipant && (
              <Tile
              ownerSessionId = {ownerSessionId}
                userDetails={userDetails}
                onPin={onPin}
                onUnpin={onUnpin}
                id={localParticipant.session_id}
                isLocal
                isPinned={true}
              />
            )}
          </div>
          <div className="aside">
            <div className="info-box">
              <h1>Waiting for others</h1>
              <p>Invite someone by sharing this link:</p>
              <div onClick={() => copyRoomUrl(window.location.href)}    className='room-url-box'>
                Click to Copy
              </div>
            </div>
          </div>
        </div>
      );
    } else if (pinnedUser == null || pinnedUser == localParticipant?.session_id) {
      return (
        <div className="call">
          <div className="pinned-user">
            {localParticipant && (
              <Tile
              ownerSessionId = {ownerSessionId}
              userDetails={userDetails}
                onUnpin={onUnpin}
                onPin={onPin}
                id={localParticipant.session_id}
                isPinned={true}
                isLocal
              />
            )}
          </div>
          <div className="aside">
            {remoteParticipantIds.map((id) => (
              <Tile 
              ownerSessionId = {ownerSessionId}
              userDetails={userDetails}
              isPinned={false} onUnpin={onUnpin} onPin={onPin} key={id} id={id} />
            ))}
          </div>
        </div>
      );
    } else if (pinnedUser != localParticipant?.session_id) {
      return (
        <div className="call">
          <div className="pinned-user">
            <Tile
            ownerSessionId = {ownerSessionId}
            userDetails={userDetails}
              onUnpin={onUnpin}
              id={pinnedUser}
              onPin={onPin}
              isPinned={true}
              key={pinnedUser}
            />
          </div>

          <div className="aside">
            {remoteParticipantIds.map((id) => {
              if (id == pinnedUser) {
                return (
                  <Tile
                  ownerSessionId = {ownerSessionId}
                  userDetails={userDetails}
                    isPinned={false}
                    onUnpin={onUnpin}
                    onPin={onPin}
                    id={localParticipant.session_id}
                    isLocal
                  />
                );
              }
              return <Tile
              ownerSessionId = {ownerSessionId}
              
              userDetails={userDetails}
              
              isPinned={false} onUnpin={onUnpin} onPin={onPin} key={id} id={id} />;
            })}
          </div>
        </div>
      );
    }
  };

  return <>{getUserMediaError ? <UserMediaError /> : renderCallScreen()}</>;
}
