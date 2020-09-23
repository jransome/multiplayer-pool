import React from 'react';
import niceSong from '../nice.mp3';
import tropicalSong from '../tropical.mp3';

const Songs = () => (
  <div style={{ marginLeft: '420px', marginTop: '20px' }}>
    <strong>Play some music!</strong>
    <br />
    <audio controls src={niceSong} />
    <br />
    <audio controls src={tropicalSong} />
  </div>
);

export default Songs;
