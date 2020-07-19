import React from 'react';
import socket from '../socket';
import Game from '../Game';
import GameView from './GameView';
import Lobby from './Lobby';

const hostGame = () => {
  const hostedGame = new Game(socket);
  hostedGame.start();
  window.game = hostedGame; // for debug
};

// initialiseScoreBoard(socket, document);

const App = () => (
  <div>
    <GameView />
    <Lobby hostGame={hostGame} />
  </div>
);

export default App;
