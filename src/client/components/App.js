import React from 'react';
import socket from '../socket';
import Game from '../Game';
import GameView from './GameView';
import Lobby from './Lobby';
import Scoreboard from './Scoreboard';
import Songs from './Songs';

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

    <div style={{ display: 'flex' }}>
      <Lobby hostGame={hostGame} />
      <Songs />
    </div>
  </div>
);

export default App;
