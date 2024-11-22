import React, { useState } from 'react';

const QUICK_ACTIONS = {
  positive: [
    { label: "Appr-pos +5", points: 5 },
    { label: "Hardw +6", points: 6 },
    { label: "Concours +3", points: 3 },
    { label: "Vict WE +3", points: 3 },
    { label: "Part WE +1", points: 1 },
    { label: "Bonus +3", points: 3 },
    { label: "Bonus +5", points: 5 },
    { label: "Fac +2", points: 2 }
  ],
  negative: [
    { label: "Oubli -3", points: -3 },
    { label: "Retard -3", points: -3 },
    { label: "Comptmt -10", points: -10 },
    { label: "Excl -15", points: -15 },
    { label: "Malus -5", points: -5 },
    { label: "Malus -3", points: -3 },
    { label: "Obs -6", points: -6 }
  ],
  rewards: [
    { label: "Félic +25", points: 25 },
    { label: "Compl +20", points: 20 },
    { label: "Encou +15", points: 15 }
  ]
};

const QuickActions = ({ teamId, playerName, updatePoints, onClose }) => {
  return (
    <div className="absolute z-10 right-0 mt-1 p-2 bg-white rounded-lg shadow-lg border w-64">
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1">
          {QUICK_ACTIONS.positive.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                updatePoints(teamId, playerName, action.points, action.label);
                onClose();
              }}
              className="px-1 py-0.5 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded"
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1">
          {QUICK_ACTIONS.negative.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                updatePoints(teamId, playerName, action.points, action.label);
                onClose();
              }}
              className="px-1 py-0.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1">
          {QUICK_ACTIONS.rewards.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                updatePoints(teamId, playerName, action.points, action.label);
                onClose();
              }}
              className="px-1 py-0.5 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const TeamCard = ({ team, updatePoints }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className={`${team.color} text-white p-2 rounded-t-lg flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{team.icon}</span>
          <span className="text-lg font-bold">{team.name}</span>
        </div>
        <span className="text-lg font-bold">{team.totalPoints}pts</span>
      </div>
      
      <div className="p-1 space-y-1">
        {team.players
          .sort((a, b) => b.points - a.points)
          .map((player) => (
            <div key={player.name} className="bg-white rounded border p-1 text-sm relative">
              <div className="flex justify-between items-center">
                <span className="font-medium">{player.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${player.points < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {player.points > 0 ? '+' : ''}{player.points}
                  </span>
                  <button
                    onClick={() => setSelectedPlayer(selectedPlayer === player.name ? null : player.name)}
                    className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                  >
                    Points
                  </button>
                </div>
              </div>
              {selectedPlayer === player.name && (
                <QuickActions
                  teamId={team.id}
                  playerName={player.name}
                  updatePoints={updatePoints}
                  onClose={() => setSelectedPlayer(null)}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

const BasketballTeams = () => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: "Werewolves",
      icon: "🐺",
      color: "bg-purple-500",
      totalPoints: 93,
      players: [
        { name: "Eymen", points: -12 },
        { name: "Assia", points: 7 },
        { name: "Ethaniel", points: 18 },
        { name: "Russy", points: 32 },
        { name: "Youssef", points: 3 },
        { name: "Lina L", points: 15 },
        { name: "Noa", points: 1 },
        { name: "Leny.K", points: 23 }
      ]
    },
    {
      id: 2,
      name: "Phoenix",
      icon: "🔥",
      color: "bg-yellow-500",
      totalPoints: 110,
      players: [
        { name: "Rayan", points: 10 },
        { name: "Khalil", points: 25 },
        { name: "Mahé", points: 22 },
        { name: "Narcisse", points: 21 },
        { name: "Daniella", points: 5 },
        { name: "Amira", points: -7 },
        { name: "Matis", points: 17 },
        { name: "Jamila", points: 5 }
      ]
    },
    {
      id: 3,
      name: "Krakens",
      icon: "🐙",
      color: "bg-teal-500",
      totalPoints: 101,
      players: [
        { name: "Melina", points: 5 },
        { name: "Maël", points: -2 },
        { name: "Swann", points: 18 },
        { name: "Nolann", points: 10 },
        { name: "Enery", points: 16 },
        { name: "Marie", points: 31 },
        { name: "Seyma Nur", points: 14 },
        { name: "Willow", points: 4 },
        { name: "Janna", points: 5 }
      ]
    },
    {
      id: 4,
      name: "Minotaurs",
      icon: "🏀",
      color: "bg-red-500",
      totalPoints: 6,
      players: [
        { name: "Alicia", points: -18 },
        { name: "Hugo", points: -2 },
        { name: "Leny.A", points: 9 },
        { name: "Lyam", points: 4 },
        { name: "Augustin", points: 11 },
        { name: "Lino", points: 7 },
        { name: "Lina D", points: 2 },
        { name: "Tom", points: -1 },
        { name: "Djilane", points: -2 },
        { name: "Talia", points: -4 }
      ]
    }
  ]);

  const [activeTeam, setActiveTeam] = useState('overview');
  const [history, setHistory] = useState([]);

  const updatePoints = (teamId, playerName, points, actionLabel) => {
    // Sauvegarder l'état actuel dans l'historique
    setHistory(prev => [...prev, {
      teams: JSON.parse(JSON.stringify(teams)),
      action: `${actionLabel} pour ${playerName}`
    }]);

    // Mettre à jour les points
    setTeams(prevTeams => {
      const newTeams = prevTeams.map(team => {
        if (team.id === teamId) {
          const newPlayers = team.players.map(player => {
            if (player.name === playerName) {
              return { ...player, points: player.points + points };
            }
            return player;
          });
          const newTotalPoints = newPlayers.reduce((sum, player) => sum + player.points, 0);
          return { ...team, players: newPlayers, totalPoints: newTotalPoints };
        }
        return team;
      });
      return newTeams;
    });
  };

  const undoLastAction = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setTeams(lastState.teams);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="w-full p-2">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTeam('overview')}
            className={`p-2 rounded ${activeTeam === 'overview' ? 'bg-gray-200' : 'bg-gray-100'}`}
          >
            👑
          </button>
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => setActiveTeam(`team-${team.id}`)}
              className={`p-2 rounded ${activeTeam === `team-${team.id}` ? 'bg-gray-200' : 'bg-gray-100'}`}
            >
              {team.icon}
            </button>
          ))}
        </div>
        
        <button
          onClick={undoLastAction}
          disabled={history.length === 0}
          className={`px-4 py-2 rounded ${
            history.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          ↩️ Annuler {history.length > 0 ? `(${history[history.length - 1].action})` : ''}
        </button>
      </div>

      {activeTeam === 'overview' ? (
        <div className="space-y-2">
          {[...teams]
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((team, index) => (
              <div
                key={team.id}
                className={`p-2 rounded-lg ${team.color} text-white flex justify-between items-center`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{index + 1}</span>
                  <span className="text-xl">{team.icon}</span>
                  <span className="font-semibold">{team.name}</span>
                </div>
                <span className="font-bold">{team.totalPoints}pts</span>
              </div>
            ))}
        </div>
      ) : (
        <TeamCard
          team={teams.find(team => `team-${team.id}` === activeTeam)}
          updatePoints={updatePoints}
        />
      )}
    </div>
  );
};

export default BasketballTeams;