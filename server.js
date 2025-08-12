const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// 🔐 MOT DE PASSE PROFESSEUR
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || 'GPwinner2026';

// Créer le dossier de données
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Base de données
const dbPath = path.join(dataDir, 'teams.db');
const db = new Database(dbPath);

// Configuration SQLite
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Créer les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    franchise TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    action TEXT NOT NULL,
    points INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    new_total INTEGER NOT NULL,
    teacher_name TEXT DEFAULT 'Anonyme',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_name) REFERENCES players (name)
  );
`);

// Données initiales
const initialFranchises = {
  Minotaurs: ['Leny', 'Lyam', 'Augustin', 'Lino', 'Lina D', 'Djilane', 'Talia'],
  Krakens: ['Swan', 'Nolann', 'Enery', 'Marie', 'Seyma Nur', 'Willow'],
  Phoenix: ['Mahé', 'Narcisse', 'Daniella', 'Matis.B', 'Jamila'],
  Werewolves: ['Assia', 'Ethaniel', 'Russy', 'Youssef', 'Lisa L', 'Noa', 'Lenny K']
};

// Initialiser les joueurs
const initPlayers = () => {
  try {
    const existingPlayers = db.prepare('SELECT COUNT(*) as count FROM players').get();
    
    if (existingPlayers.count === 0) {
      console.log('🎯 Initialisation des joueurs...');
      const insertPlayer = db.prepare('INSERT INTO players (name, franchise, score) VALUES (?, ?, ?)');
      
      const transaction = db.transaction(() => {
        Object.entries(initialFranchises).forEach(([franchise, players]) => {
          players.forEach(player => {
            insertPlayer.run(player, franchise, 0);
          });
        });
      });
      
      transaction();
      console.log('✅ Joueurs initialisés');
    }
  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
  }
};

initPlayers();

// === ROUTES API ===

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Vérification mot de passe professeur
app.post('/api/verify-teacher', (req, res) => {
  try {
    const { password } = req.body;
    res.json({ success: password === TEACHER_PASSWORD });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer tous les joueurs
app.get('/api/players', (req, res) => {
  try {
    const players = db.prepare('SELECT * FROM players ORDER BY score DESC').all();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un joueur spécifique
app.get('/api/player/:playerName', (req, res) => {
  try {
    const player = db.prepare('SELECT * FROM players WHERE name = ?').get(req.params.playerName);
    if (player) {
      res.json(player);
    } else {
      res.status(404).json({ error: 'Joueur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer l'historique
app.get('/api/history/:playerName', (req, res) => {
  try {
    const history = db.prepare('SELECT * FROM history WHERE player_name = ? ORDER BY created_at DESC LIMIT 100').all(req.params.playerName);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter des points
app.post('/api/add-points', (req, res) => {
  try {
    const { playerName, points, action, teacherName } = req.body;
    
    const transaction = db.transaction(() => {
      const updatePlayer = db.prepare('UPDATE players SET score = score + ? WHERE name = ?');
      const result = updatePlayer.run(points, playerName);
      
      if (result.changes === 0) {
        throw new Error('Joueur non trouvé');
      }
      
      const player = db.prepare('SELECT score FROM players WHERE name = ?').get(playerName);
      
      const insertHistory = db.prepare('INSERT INTO history (player_name, action, points, timestamp, new_total, teacher_name) VALUES (?, ?, ?, ?, ?, ?)');
      const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
      insertHistory.run(playerName, action, points, timestamp, player.score, teacherName || 'Anonyme');
      
      return player.score;
    });
    
    const newScore = transaction();
    res.json({ success: true, newScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Annuler dernière action
app.delete('/api/undo-last/:playerName', (req, res) => {
  try {
    const playerName = req.params.playerName;
    
    const transaction = db.transaction(() => {
      const lastAction = db.prepare('SELECT * FROM history WHERE player_name = ? ORDER BY created_at DESC LIMIT 1').get(playerName);
      
      if (!lastAction) {
        throw new Error('Aucune action à annuler');
      }
      
      const updatePlayer = db.prepare('UPDATE players SET score = score - ? WHERE name = ?');
      updatePlayer.run(lastAction.points, playerName);
      
      const deleteHistory = db.prepare('DELETE FROM history WHERE id = ?');
      deleteHistory.run(lastAction.id);
      
      const player = db.prepare('SELECT score FROM players WHERE name = ?').get(playerName);
      return player ? player.score : 0;
    });
    
    const newScore = transaction();
    res.json({ success: true, newScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un élève
app.post('/api/add-student', (req, res) => {
  try {
    const { name, franchise } = req.body;
    
    if (!name || !franchise) {
      return res.status(400).json({ error: 'Nom et franchise requis' });
    }
    
    const existing = db.prepare('SELECT * FROM players WHERE name = ?').get(name);
    if (existing) {
      return res.status(400).json({ error: 'Un élève avec ce nom existe déjà' });
    }
    
    const insertPlayer = db.prepare('INSERT INTO players (name, franchise, score) VALUES (?, ?, ?)');
    insertPlayer.run(name, franchise, 0);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un élève
app.delete('/api/remove-student/:playerName', (req, res) => {
  try {
    const playerName = req.params.playerName;
    
    const transaction = db.transaction(() => {
      const deleteHistory = db.prepare('DELETE FROM history WHERE player_name = ?');
      deleteHistory.run(playerName);
      
      const deletePlayer = db.prepare('DELETE FROM players WHERE name = ?');
      const result = deletePlayer.run(playerName);
      
      return result.changes > 0;
    });
    
    const success = transaction();
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Élève non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Servir l'application (DOIT ÊTRE EN DERNIER)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion arrêt propre
const shutdown = () => {
  console.log('\n🛑 Arrêt du serveur...');
  try {
    db.close();
  } catch (error) {
    console.error('Erreur fermeture DB:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Démarrage serveur
app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`🚀 Serveur démarré sur le port ${port}`);
  console.log(`🔐 Mot de passe: ${TEACHER_PASSWORD}`);
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log('='.repeat(50));
});
