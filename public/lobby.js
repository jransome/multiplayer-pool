function initialiseLobby(socket, hostGame) {
  const nameControls = document.querySelector('#nameControls');
  const nameInput = document.querySelector('#nameInput');
  const playerNameListing = document.querySelector('#playerNameListing');
  const loginButton = document.querySelector('#loginBtn');

  const lobbyControls = document.querySelector('#lobbyControls');
  const idLabel = document.querySelector('#idLabel');
  const idInput = document.querySelector('#idInput');
  const hostButton = document.querySelector('#hostBtn');
  const joinButton = document.querySelector('#joinBtn');

  const gameControls = document.querySelector('#gameControls');
  const winControls = document.querySelector('#winControls');
  const iWinButton = document.querySelector('#iWinBtn');

  lobbyControls.style.display = 'none';
  gameControls.style.display = 'none';
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
    const welcomeMsg = document.createElement('h3')
    welcomeMsg.textContent = `Welcome ${playerName}`;
    playerNameListing.appendChild(welcomeMsg);

    nameControls.style.display = 'none';
    lobbyControls.style.display = 'initial';
    socket.emit('login', playerName);
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

  const joinGame = () => {
    if (isNaN(+idInput.value)) {
      console.log('Invalid game Id entered');
      return;
    }
    socket.emit('joinAttempt', +idInput.value, (isSuccessful) => {
      if (!isSuccessful) {
        console.log('failed to join game');
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
