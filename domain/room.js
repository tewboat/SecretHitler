const crypto = require('crypto');
const Player = require('./player');
const GameState = require('./gameState');

class Room {

    constructor(name, password, maxPlayersCount) {
        this.name = name;
        this.players = [];
        this.id = crypto.randomUUID();
        this.maxPlayersCount = maxPlayersCount;
        this.password = password;
        this.gameState = undefined;
        this.readyCount = 0;
        this.gameStarted = false;
    }

    findBy(array, condition) {
        let result = []
        for (let pl of this.players)
            if (condition(pl))
                result.push(pl);
        return result;
    }

    addPlayer(username, socket) {
        if (this.isFull()) throw new Error("this room already full");
        let counter = 0;
        let newUsername = username;
        while(this.findBy(this.players, (p) => p.nickname === newUsername).length !== 0){
            newUsername = username + counter;
            counter++;
        }
        this.players.push(new Player(newUsername, socket));
        return this.players.length - 1;
    }

    removePlayer(socketId) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].socketID === socketId) {
                this.players.splice(i, 1);
                return;
            }
        }
    }

    isGameStarted() {
        return this.gameStarted;
    }

    isAllReady() {
        return this.readyCount === this.maxPlayersCount;
    }

    readinessCheck(){
        this.readyCount = 0;
        this.players.forEach(player => player.ready = false);
        this.notifyPlayers('readinessCheck', null, () => true);
    }

    setReady(socketID) {
        let pl = this.findBy(this.players, (pl) => pl.socketID === socketID);
        if (pl.length !== 1) throw new Error("socket ready error");
        if (pl[0].ready !== true) {
            pl[0].ready = true;
            this.readyCount++;
        }
        return this.isAllReady();
    }

    isFull() {
        return this.players.length === this.maxPlayersCount;
    }

    notifyPlayers(tag, message, selector) {
        for (let player of this.players) {
            if (selector(player)) {
                player.socket.emit(tag, message);
            }
        }
    }

    getPlayersList() {
        const players = [];
        for (let player of this.players) {
            players.push({
                nickname: player.nickname,
                role: player.role,
                src: player.src
            });
        }
        return players;
    }


    runGame() {
        if (this.players.length !== this.maxPlayersCount) {
            return;
        }
        this.gameStarted = true;
        this.gameState = new GameState(this.maxPlayersCount, this.players, this.name);
        this.gameState.run();
    }
}

module.exports = Room;