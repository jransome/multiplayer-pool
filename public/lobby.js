function initialiseLobby(socket, hostGame) {
  const nameControls = document.querySelector('#nameControls');
  const nameInput = document.querySelector('#nameInput');
  const nameLabel = document.querySelector('#nameLabel');
  const loginButton = document.querySelector('#loginBtn');

  const lobbyControls = document.querySelector('#lobbyControls');
  const idLabel = document.querySelector('#idLabel');
  const idInput = document.querySelector('#idInput');
  const hostButton = document.querySelector('#hostBtn');
  const joinButton = document.querySelector('#joinBtn');

  lobbyControls.style.display = 'none';
  loginButton.style.display = 'none';

  let playerName = null;

  const login = () => {
    if (!nameInput.value) return;
    playerName = DOMPurify.sanitize(nameInput.value);
    console.log(playerName)
    nameLabel.textContent = `Welcome ${playerName}`;
    lobbyControls.style.display = 'initial';
    nameControls.style.display = 'none';
    socket.emit('login', playerName);
  }

  loginButton.addEventListener('click', login);
  nameInput.addEventListener('keyup', (event) => {
    loginButton.style.display = !!nameInput.value ? 'initial' : 'none';
    if (event.key === 'Enter') login();
  });

  hostButton.addEventListener('click', () => {
    socket.emit('hosting', (gameId) => {
      console.log('started game', gameId);
      idLabel.textContent = `Game ID: ${gameId}`;
      lobbyControls.style.display = 'none';
    });
    hostGame();
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
      }
    });
  }

  joinButton.addEventListener('click', joinGame);
  idInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') joinGame();
  });
}
