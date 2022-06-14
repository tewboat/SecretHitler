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
            this.players.push(new Player(username, socket, socket.id));
            return this.players.length - 1;
        } else {
            throw new Error("that nickname already exists");
        }
    }

    removePlayer(socketId) {
        let newArray = this.findBy(this.players, (p) => p.socketID !== socketId);
        if (newArray.length === this.players.length)
            throw new Error("no such socketID to delete");
        else {
            this.readyCount--;
            this.players = newArray;
        }
    }

    isAllReady(){
        return this.readyCount === this.maxPlayersCount;
    }

    setReady(socketID){
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

    // TODO change for array
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
                role: player.role
            });
        }
        return players;
    }

    getPlayersInfoList(selector) {
        const playersInfo = [];
        for (let player of this.gameState.players) {
            playersInfo.push(selector(player));
        }
        return playersInfo;
    }

    runGame() {
        if (this.players.length !== this.maxPlayersCount) {
            return;
        }

        this.gameState = new GameState(this.maxPlayersCount, this.players);
        const fascistList = this.getPlayersInfoList(player => {
            return {
                src: player.src,
                nickname: player.nickname
            }
        });

        this.notifyPlayers('playersListUpdated', JSON.stringify({
            payload: {
                players: fascistList
            }
        }), player => player.party === Const.Party.Fascist);

        const hilterList = undefined;
        if (this.maxPlayersCount <= 6) {
            hilterList = fascistList;
        } else {
            hilterList = this.getPlayersInfoList(player => {
                if (player.isHitler) {
                    return {
                        src: player.src,
                        nickname: player.nickname
                    }
                    return {
                        src: 'views/images/rolesCards/card_shirt.png',
                        nickname: player.nickname
                    }
                }
            });

            this.notifyPlayers('playersListUpdated', JSON.stringify({
                payload: {
                    players: hilterList
                }
            }), player => player.isHitler);

            for (let player in this.gameState.players) {
                if (player.party !== Const.Party.Liberal) continue;
                const list = this.getPlayersInfoList(p => {
                    if (player === p) {
                        return {
                            src: player.src,
                            nickname: player.nickname
                        }
                        return {
                            src: 'views/images/rolesCards/card_shirt.png',
                            nickname: player.nickname
                        }
                    }
                });
                this.notifyPlayers('playersListUpdated', JSON.stringify({
                    payload: {
                        players: hilterList
                    }
                }), p => p === player);
            }
        }
    }
}

module.exports = Room;