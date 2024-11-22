import React, { useState, useEffect } from 'react';

// Clé pour le stockage local
const STORAGE_KEY = 'basketballTeamsData';

// Fonction pour obtenir les données initiales (votre état initial actuel)
const getInitialTeams = () => ([
  {
    id: 1,
    name: "Werewolves",
    icon: "🐺",
    color: "bg-purple-500",
    totalPoints: 93,
    players: [
      { name: "Eymen", points: -12 },
      // ... autres joueurs
    ]
  },
  // ... autres équipes
]);

const BasketballTeams = () => {
  // Initialisation avec localStorage
  const [teams, setTeams] = useState(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Erreur lors de la lecture des données:', e);
        return getInitialTeams();
      }
    }
    return getInitialTeams();
  });

  const [activeTeam, setActiveTeam] = useState('overview');
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY + '_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Sauvegarde des équipes quand elles changent
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  }, [teams]);

  // Sauvegarde de l'historique quand il change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_history', JSON.stringify(history));
  }, [history]);

  // Fonction pour réinitialiser les données
  const resetData = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser toutes les données ?')) {
      const initialTeams = getInitialTeams();
      setTeams(initialTeams);
      setHistory([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTeams));
      localStorage.setItem(STORAGE_KEY + '_history', JSON.stringify([]));
    }
  };

  // Ajout d'un bouton de réinitialisation dans le composant
  const HeaderButtons = () => (
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
      
      <div className="flex gap-2">
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
        
        <button
          onClick={resetData}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          🔄 Réinitialiser
        </button>
      </div>
    </div>
  );

  // Le reste de votre code reste identique...

  return (
    <div className="w-full p-2">
      <HeaderButtons />
      {/* Reste du JSX... */}
    </div>
  );
};

export default BasketballTeams;