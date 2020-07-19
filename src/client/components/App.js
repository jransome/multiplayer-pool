import React from 'react';
import socket from '../socket';
import Game from '../Game';
import GameView from './GameView';
import Lobby from './Lobby';
import Scoreboard from './Scoreboard';

const hostGame = () => {
  const hostedGame = new Game(socket);
  hostedGame.start();
  window.game = hostedGame; // for debug
};

const App = () => (
  <div>
    <div style={{ display: 'flex' }}>
      <GameView />
      <Scoreboard />
    </div>
    <Lobby hostGame={hostGame} />
  </div>
);

export default App;
