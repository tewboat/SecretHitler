const crypto = require('crypto');
import Player from './player';

class Room{
    currentPlayersCount = 0;
    players = new Map;
    clients = new Map();

    constructor(roomName, maxPlayersCount) {
        if (!this.validateName(roomName))
            throw new Error('Incorrect room name');
        this.id = crypto.randomUUID();
        this.name = roomName;
        this.maxPlayersCount = maxPlayersCount;
    }

    validateName(roomName){
        return roomName.length > 0;
    }

    addPlayer(name, socket){
        this.clients.set(socket.id, socket)
        this.players.set(socket.id, new Player(name, socket.id))
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

    update(){

    }
}