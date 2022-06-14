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
    }

    findBy(array, condition){
        let result = []
        for(let pl of this.players)
            if (condition(pl))
                result.push(pl);
        return result;
    }

    apply(array, action){
        for (let e of array)
            action(e);
    }

    addPlayer(username, socket) {
        if (this.isFull()) throw new Error("this room already full");
        if (this.findBy(this.players, (p) => p.nickname === username).length === 0) {
            this.players.push(new Player(username, socket, socket.id));
            return this.players.length - 1;
        }
        else{
            throw new Error("that nickname already exists");
        }
    }

    removePlayer(socketId) {
        let newArray = this.findBy(this.players, (p) => p.socketID !== socketId);
        if (newArray.length === this.players.length)
            throw new Error("no such socketID to delete");
        else
            this.players = newArray;
    }

    isFull() {
        return this.players.length === this.maxPlayersCount;
    }

    // TODO change for array
    notifyPlayers(tag, message, selector) {
        for (let player of this.players) {
            if (selector(player)) {
                player.socket.emit(tag, message);
            }
        }
    }

    getPlayersList(){
        const players = [];
        for (let player of this.players) {
            players.push({
                nickname: player.nickname,
                role: player.role
            });
        }
        return players;
    }

    runGame(){
        if (this.players.length !== this.maxPlayersCount) {
            return;
        }

        this.gameState = new GameState(this.maxPlayersCount, this.players);
        const fascistList = [];
        for (let player of this.gameState.players){
            fascistList.push({
                src: player.src, // TODO
                nickname: player.nickname
            })
        }

    }
}

module.exports = Room;