import React, { useState } from 'react';
import socket from '../socket';

const Scoreboard = () => {
  const [playerScores, setPlayerScores] = useState([]);

  socket.on('scoreUpdate', (playerData) => {
    if (playerData && playerData.length) {
      const scores = playerData
        .map(p => ({
          ...p,
          netScore: p.gamesWon - p.gamesLost,
        }))
        .sort((a, b) => b.gamesWon - a.gamesWon)
        .sort((a, b) => b.netScore - a.netScore);

      setPlayerScores(scores);
    }
  });

  const row = player => (
    <tr>
      <td>{player.name}</td>
      <td>{player.gamesWon}</td>
      <td>{player.gamesLost}</td>
    </tr>
  );

  return (
    <table>
      <tr>
        <th>Name</th>
        <th>Wins</th>
        <th>Losses</th>
      </tr>
      {playerScores.map(score => row(score))}
    </table>
  );
};

export default Scoreboard;
