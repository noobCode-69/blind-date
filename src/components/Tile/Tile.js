import './Tile.css';
import { useEffect, useRef, useState } from 'react';
import { useMediaTrack, useDaily } from '@daily-co/daily-react-hooks';
import Username from '../Username/Username';
import TileVideo from '../TileVideo/TileVideo';

export default function Tile({ id, isLocal, isPinned, onPin, onUnpin }) {
  const audioTrack = useMediaTrack(id, 'audio');

  const audioElement = useRef(null);

  const callObject = useDaily();
  const isOwner = callObject._participants.local.owner;

  const [activeSpeaker, setActiveSpeaker] = useState(false);

  useEffect(() => {
    callObject.on('active-speaker-change', (val) => {
      const speaker = val.activeSpeaker.peerId;
      // console.log(speaker);
      if (speaker === id) {
        setActiveSpeaker(true);
      } else {
        setActiveSpeaker(false);
      }
    });
  }, []);

  useEffect(() => {
    if (audioTrack?.state === 'playable') {
      audioElement?.current &&
        (audioElement.current.srcObject =
          audioTrack && new MediaStream([audioTrack.persistentTrack]));
    }
  }, [audioTrack]);

  let containerCssClasses = 'tile-video';

  if (isLocal) {
    containerCssClasses += ' self-view';
  }

  if (isPinned) {
    containerCssClasses += ' pinned';
  }

  let onClickHandler = () => {
    if (isPinned) {
      onUnpin(id);
    } else {
      onPin(id);
    }
  };

  let pinUnpin = () => {
    if (isPinned == false) {
      return (
        <div onClick={onClickHandler} className="pin-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#c8d1dc"
              d="M11 17h2v5l-2 2v-7zm7-2h-12c0-3.128.091-4.744 1.874-7.276.551-.783.915-1.3.915-2.373 0-2.372-1.789-1.695-1.789-5.351h10c0 3.616-1.789 3.005-1.789 5.35 0 1.073.364 1.59.915 2.374 1.785 2.535 1.874 4.154 1.874 7.276zm-9.968-2h7.936c-.298-4.376-2.756-4.142-2.756-7.649-.001-1.605.521-2.351 1.271-3.351h-4.966c.75 1 1.272 1.745 1.272 3.35 0 3.487-2.46 3.29-2.757 7.65z"
            />
          </svg>{' '}
        </div>
      );
    } else {
      if (isLocal) {
        return null;
      }
      return (
        <div onClick={onClickHandler} className="pin-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#c8d1dc"
              d="M8 17h2v5l-2 2v-7zm4.462-6.412c.246.625.437 1.39.506 2.412h-7.936c.297-4.36 2.757-4.163 2.757-7.65 0-1.605-.522-2.35-1.272-3.35h4.512c.518-.807 1.207-1.489 2.019-2h-9.048c0 3.656 1.789 2.979 1.789 5.351 0 1.073-.364 1.59-.915 2.373-1.782 2.532-1.874 4.148-1.874 7.276h12c0-1.27-.021-2.287-.159-3.222-.88-.232-1.688-.64-2.379-1.19zm8.538-5.088c0 2.485-2.017 4.5-4.5 4.5s-4.5-2.015-4.5-4.5 2.017-4.5 4.5-4.5 4.5 2.015 4.5 4.5zm-3.086-2.122l-1.414 1.414-1.414-1.414-.707.708 1.414 1.414-1.414 1.414.707.708 1.414-1.415 1.414 1.414.708-.708-1.414-1.413 1.414-1.414-.708-.708z"
            />
          </svg>
        </div>
      );
    }
  };

  let sendMessage = (id) => {
    callObject.sendAppMessage({ type: 'SUBSCRIBE', msg: id }, '*');
  };

  return (
    <div
      style={{
        borderRadius: '4px',
        outline: activeSpeaker == true ? '3px solid lightblue' : 'none',
      }}
      className={containerCssClasses}>
      {<TileVideo id={id} />}
      {audioTrack && <audio autoPlay playsInline ref={audioElement} />}
      <div className="user-info-container">
        <Username id={id} isLocal={isLocal} />
        {pinUnpin()}
        {isOwner == true && !isLocal && (
          <div className="subscribe-button" onClick={() => sendMessage(id)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 26 26">
              <path fill="#c8d1dc" d="M10 18.993h6s-.765 2.354-3 2.354c-2.153 0-3-2.354-3-2.354zm8.927-3.995c0 1.262-1.171 2.25-2.667 2.25-1.138 0-1.954-.577-2.394-1.404-.229-.432-.412-.932-.867-.932s-.638.5-.867.932c-.439.828-1.255 1.404-2.394 1.404-1.495 0-2.667-.988-2.667-2.25s1.171-2.25 2.667-2.25c1.01 0 1.862.456 2.315 1.138.307-.102.615-.153.945-.153s.638.051.945.153c.453-.681 1.305-1.138 2.315-1.138 1.498 0 2.669.988 2.669 2.25zm-8.021 0c0-.414-.522-.75-1.167-.75s-1.167.336-1.167.75.522.75 1.167.75 1.167-.336 1.167-.75zm6.521 0c0-.414-.522-.75-1.167-.75s-1.167.336-1.167.75.522.75 1.167.75 1.167-.336 1.167-.75zm8.573-2.295c0 2.196-.95 4.32-2 5.728h-.002c-.509.741-1.208 1.386-2.137 1.781-2.349 3.731-5.484 5.781-8.861 5.781s-6.514-2.05-8.861-5.781c-.929-.395-1.628-1.04-2.137-1.781h-.002c-1.05-1.407-2-3.531-2-5.728 0-5.613 3.099-9.482 9.306-8.075-.781-.679-1.924-1.148-3.08-1.351 2.168-2.995 5.43-3.284 6.774-3.284s4.606.289 6.774 3.284c-1.156.203-2.3.672-3.08 1.351 6.121-1.388 9.306 2.356 9.306 8.075zm-5.985-.981c-4.757.28-7.015-2.135-7.015-3.458 0 1.324-2.257 3.738-7.015 3.458-2.557 7.819 2.914 12.271 7.015 12.271 3.894 0 9.642-4.237 7.015-12.271z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
