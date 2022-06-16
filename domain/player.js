const types = require('./constants');

class Player{
    constructor(nickname, socket){
        this.socket = socket;
        this.socketID = socket.id;
        this.nickname = nickname;
        this.role = types.Role.Player;
        this.party = undefined;
        this.isHitler = false;
        this.src = 'images/rolesCards/card_shirt.png';
        this.ready = false;
    }
}

module.exports = Player