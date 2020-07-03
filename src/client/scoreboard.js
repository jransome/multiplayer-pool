const initialiseScoreBoard = (socket, document) => {
  const scoreboardDiv = document.querySelector('#scoreboard');

  const constructRow = player => `
  <tr>
    <td>${player.name}</td>
    <td>${player.gamesWon}</td>
    <td>${player.gamesLost}</td>
  </tr>
  `;

  const constructTable = players => `
  <table>
    <tr>
      <th>Name</th>
      <th>Wins</th>
      <th>Losses</th>
    </tr>
    ${players.map(constructRow)}
  </table>
  `;

  socket.on('scoreUpdate', (playerData) => {
    console.log('scores updated', playerData);
    if (playerData && playerData.length) {
      const rankedData = playerData.map(p => ({
        ...p,
        netScore: p.gamesWon - p.gamesLost,
      })).sort((a, b) => b.netScore - a.netScore);
      scoreboardDiv.innerHTML = constructTable(rankedData);
    }
  });
};

module.exports = {
  initialiseScoreBoard,
};
