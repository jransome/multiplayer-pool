import React from 'react';
import tropicalSong from '../tropical.mp3';

const Songs = () => (
  <div style={{ marginLeft: '420px', marginTop: '20px' }}>
    <strong>Play some music!</strong>
    <br />
    <audio controls src={tropicalSong} />
  </div>
);

export default Songs;
