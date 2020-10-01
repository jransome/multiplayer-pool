import React from 'react';
import niceSong from '../nice.mp3';
import tropicalSong from '../tropical.mp3';
import irishSong from '../irish.mp3';

const Songs = () => (
  <div style={{ marginLeft: '420px', marginTop: '20px' }}>
    <strong>Play some music!</strong>
    <br />
    <audio controls src={niceSong} />
    <br />
    <audio controls src={tropicalSong} />
    <br />
    <audio controls src={irishSong} />
  </div>
);

export default Songs;
