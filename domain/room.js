const crypto = require('crypto');
const Player = require('./player');
const GameState = require('./gameState');
const Const = require('./constants');

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

    apply(array, action) {
        for (let e of array)
            action(e);
    }

    addPlayer(username, socket) {
        if (this.isFull()) throw new Error("this room already full");
        if (this.findBy(this.players, (p) => p.nickname === username).length === 0) {
            this.players.push(new Player(username, socket));
            return this.players.length - 1;
        } else {
            //throw new Error("that nickname already exists");
        }
    }

    removePlayer(socketId) {
        let newArray = this.findBy(this.players, (p) => p.socketID !== socketId);
        if (newArray.length === this.players.length) {
            //throw new Error("no such socketID to delete");
        }
        else {
            this.readyCount--;
            this.players = newArray;
        }
    }

    isGameStarted(){
        return this.gameStarted;
    }

    isAllReady() {
        return this.readyCount === this.maxPlayersCount;
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
        }this.gameStarted = true;
        this.gameState = new GameState(this.maxPlayersCount, this.players);
        this.gameState.run();
    }
}

module.exports = Room;