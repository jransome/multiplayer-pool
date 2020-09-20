import React from 'react';
import tropicalSong from '../tropical.mp3';

const Songs = () => (
  <div>
    <strong>Play some music!</strong> 
    <br />
    <audio controls src={tropicalSong} />
  </div>
);

export default Songs;
