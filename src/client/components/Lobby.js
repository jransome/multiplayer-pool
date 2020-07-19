import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import socket from '../socket';

const Lobby = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState(null);
  const [playerName, setPlayerName] = useState(null);

  const [gameIdInputValue, setGameIdInputValue] = useState(null);
  const [gameIdLabel, setGameIdLabel] = useState(null);
  const [joinFeedback, setJoinFeedback] = useState(null);

  const [playerNameListing, setPlayerNameListing] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isWinnable, setIsWinnable] = useState(false);
  const [victorName, setVictorName] = useState(null);

  socket.on('playerListingUpdated', (playerNameList) => {
    setPlayerNameListing(`${playerNameList[0]} Vs ${playerNameList[1] || '...'}`);
    setIsWinnable(playerNameList.length > 1);
  });

  socket.on('victoryClaimed', claimantName => setVictorName(claimantName));

  const login = () => {
    if (!playerName || playerName.length < 3) return;
    setPlayerName(DOMPurify.sanitize(playerName));
    socket.emit('login', playerName, (isSuccessful) => {
      if (!isSuccessful) {
        setLoginFeedback(`${playerName} is already logged in!`);
        return;
      }

      setLoginFeedback(`Welcome ${playerName}`);
      setIsLoggedIn(true);
    });
  };

  const host = () => {
    socket.emit('hosting', (gameId) => {
      setGameIdLabel(`Game ID: ${gameId}`);
      props.hostGame();
      setGameStarted(true);
    });
  };

  const join = () => {
    socket.emit('joinAttempt', gameIdInputValue, (isSuccessful) => {
      if (!isSuccessful) setJoinFeedback(`game ${gameIdInputValue} does not exist or has ended`);
      else setGameStarted(true);
    });
  };

  return (
    <div>
      <h2>Pool From Home!</h2>
      <h3>{gameIdLabel}</h3>
      <h3>{playerNameListing}</h3>
      <h3>{loginFeedback}</h3>

      {!isLoggedIn && (
        <div>
          <p>Enter your name to start (min 3 characters):</p>
          <input
            type="text"
            placeholder="my name is..."
            maxLength="20"
            onChange={e => setPlayerName(e.target.value)}
            onKeyUp={e => e.key === 'Enter' && login()}
          />
          {playerName && playerName.length > 2 && <button onClick={login} type="button">Go</button>}
        </div>
      )}

      {isLoggedIn && !gameStarted && (
        <div>
          <button onClick={host} type="button">Host game</button>
          <p>===== or join an existing one: =====</p>
          <input
            type="number"
            placeholder="enter game Id"
            onChange={e => setGameIdInputValue(+e.target.value)}
            onKeyUp={e => e.key === 'Enter' && join()}
          />
          <button onClick={join} type="button">Join game</button>
          {joinFeedback && <p>{joinFeedback}</p>}
        </div>
      )}

      {isLoggedIn && gameStarted && (
        <div>
          <p>
            How to play: Click to set direction of shot, then hit a number to indicate shot power. 9 = smash, 1 = veeery
            light tap
          </p>
          <p>Press &#39;r&#39; to reset the cue ball</p>
          {isWinnable && (
            <div>
              <p>==========</p>
              <p>Did you win? NO CHEATING</p>
              <button
                disabled={!!victorName}
                onClick={() => socket.emit('claimWin')}
                type="button"
              >
                {victorName ? `${victorName} claimed VICTORY!` : 'YEAH I WON!'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Lobby.propTypes = {
  hostGame: PropTypes.func.isRequired,
};

export default Lobby;
