import { useMediaTrack } from '@daily-co/daily-react-hooks';
import { memo, useEffect, useRef } from 'react';

const TileVideo = memo(function ({ id }) {
  const videoTrack = useMediaTrack(id, 'video');

  const videoElement = useRef(null);

  useEffect(() => {
    const video = videoElement.current;
    if (!video || !videoTrack?.persistentTrack || videoTrack?.state != 'playable') return;
    /*  The track is ready to be played. We can show video of the participant in the UI.*/
    video.srcObject = new MediaStream([videoTrack?.persistentTrack]);
  }, [videoTrack?.persistentTrack, videoTrack?.state]);

  if (!videoElement) return null;
  return <video autoPlay muted playsInline ref={videoElement} />;
});

export default TileVideo;
