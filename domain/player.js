const types = require('./constants');

//TODO do we really need role?

class Player{
    constructor(nickname, socket){
        this.socket = socket;
        this.socketID = socket.id;
        this.nickname = nickname;
        this.role = types.Role.Player;
        this.party = undefined;
        this.isHitler = false;
        this.src = undefined;
        this.ready = false;
    }
}

module.exports = Player