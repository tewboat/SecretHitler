const crypto = require('crypto');
const Player = require('./player.js');

class Room{
    players = new Map();
    clients = new Map();

    constructor(password, maxPlayersCount) {
        this.id = crypto.randomUUID();
        this.maxPlayersCount = maxPlayersCount;
        this.password = password;
    }

    validateName(roomName){
        return roomName.length > 0;
    }

    addPlayer(username, socket){
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

    getPlayerNameBySocketId(socketID) {
        if (this.players.has(socketID)) {
            return this.players.get(socketID).name
        }
    }

    notifyUsers(action){
        for (let client of this.clients){
            action(this.clients[client]);

        }
    }
}

module.exports = Room