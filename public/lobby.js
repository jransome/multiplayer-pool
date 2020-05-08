function initialiseLobby(socket, hostGame) {
  const idLabel = document.querySelector('#idLabel');
  const idInput = document.querySelector('#idInput');
  const hostButton = document.querySelector('#hostBtn');
  const joinButton = document.querySelector('#joinBtn');

  hostButton.addEventListener('click', () => {
    socket.emit('hosting', (gameId) => {
      console.log('started game', gameId);
      idLabel.innerText = `Game ID: ${gameId}`;
      hostButton.disabled = true;
      joinButton.disabled = true;
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
        hostButton.disabled = true;
        joinButton.disabled = true;
      }
    });
  }

  joinButton.addEventListener('click', joinGame);
  idInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') joinGame();
  });
}
