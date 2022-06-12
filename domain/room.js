const crypto = require('crypto');
const Player = require('./player.js');

class Room {
    players = new Map();
    clients = new Map();

    constructor(name, password, maxPlayersCount) {
        this.name = name;
        this.id = crypto.randomUUID();
        this.maxPlayersCount = maxPlayersCount;
        this.password = password;
    }

    isFull() {
        return this.players.size === this.maxPlayersCount;
    }

    addPlayer(username, socket) {
        this.clients.set(socket.id, socket);
        this.players.set(socket.id, new Player(username));
        return this.players.size - 1;
    }

    removePlayer(socketId) {
        if (this.clients.has(socketId)) {
            this.clients.delete(socketId)
        }
        if (this.players.has(socketId)) {
            const player = this.players.get(socketId)
            this.players.delete(socketId)
            return player.name
        }
    }

    notifyPlayers(tag, message) {
        for (let client of this.clients) {
            client[1].emit(tag, message);
        }
    }

    getPlayersList
}

module.exports = Room