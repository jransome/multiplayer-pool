import React from 'react';
import oneFourSix from '../songs/I-IV-VI.m4a';
import pianoSong from '../songs/Piano.m4a';
import retroSong from '../songs/RetroDemoPlanning.m4a';
import tropicalSong from '../songs/tropical.mp3';

const Songs = () => (
  <div style={{ marginLeft: '420px', marginTop: '20px' }}>
    <strong>Play some music!</strong>
    <br /> 80s <audio controls src={retroSong} />
    <br /> Tropical <audio controls src={tropicalSong} />
    <br /> Piano <audio controls src={pianoSong} />
    <br /> Guitar <audio controls src={oneFourSix} />
  </div>
);

export default Songs;
