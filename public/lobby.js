function initialiseLobby(socket, hostGame) {
  const nameControls = document.querySelector('#nameControls');
  const nameInput = document.querySelector('#nameInput');
  const playerNameListing = document.querySelector('#playerNameListing');
  const loginButton = document.querySelector('#loginBtn');
  const loginMsg = document.createElement('h3');
  playerNameListing.appendChild(loginMsg);

  const lobbyControls = document.querySelector('#lobbyControls');
  const idLabel = document.querySelector('#idLabel');
  const idInput = document.querySelector('#idInput');
  const hostButton = document.querySelector('#hostBtn');
  const joinButton = document.querySelector('#joinBtn');

  const gameControls = document.querySelector('#gameControls');
  const winControls = document.querySelector('#winControls');
  const iWinButton = document.querySelector('#iWinBtn');

  loginButton.style.display = 'none';
  winControls.style.display = 'none';
  iWinButton.addEventListener('click', () => {
    socket.emit('claimWin');
    iWinButton.disabled = true;
  });

  socket.on('victoryClaimed', (claimantName) => {
    iWinButton.textContent = `${claimantName} claimed VICTORY!`;
    iWinButton.disabled = true;
  });

  let playerName = null;
  socket.on('playerListingUpdated', (playerNameList) => {
    playerNameListing.textContent = `${playerNameList[0]} Vs ${playerNameList[1] || '...'}`;
    if (playerNameList.length > 1) winControls.style.display = 'initial';
  });

  const login = () => {
    if (!nameInput.value || nameInput.value.length < 3) return;
    playerName = DOMPurify.sanitize(nameInput.value);
    socket.emit('login', playerName, (isSuccessful) => {
      if(!isSuccessful){
        loginMsg.textContent = `${playerName} is already logged in!`;
        return;
      }
      
      loginMsg.textContent = `Welcome ${playerName}`;
      nameControls.style.display = 'none';
      lobbyControls.style.display = 'initial';
    });
  }
  loginButton.addEventListener('click', login);
  nameInput.addEventListener('keyup', (event) => {
    loginButton.style.display = !!nameInput.value ? 'initial' : 'none';
    if (event.key === 'Enter') login();
  });

  const onStartGame = () => {
    lobbyControls.style.display = 'none';
    gameControls.style.display = 'initial';
  }

  hostButton.addEventListener('click', () => {
    socket.emit('hosting', (gameId) => {
      console.log('started game', gameId);
      idLabel.textContent = `Game ID: ${gameId}`;
      lobbyControls.style.display = 'none';
      hostGame();
      onStartGame();
    });
  });

  const joinFeedback = document.createElement('p');
  lobbyControls.appendChild(joinFeedback);
  const joinGame = () => {
    socket.emit('joinAttempt', +idInput.value, (isSuccessful) => {
      if (!isSuccessful) {
        joinFeedback.textContent = `game ${idInput.value} does not exist or has ended`;
      } else {
        console.log('joining game!');
        lobbyControls.style.display = 'none';
        onStartGame();
      }
    });
  }

  joinButton.addEventListener('click', joinGame);
  idInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') joinGame();
  });
}
