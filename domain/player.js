const types = require('./constants');

//TODO do we really need role?

class Player{
    constructor(nickname){
        this.nickname = nickname;
        this.role = types.Role.Player;
        this.party = undefined;
        this.isHitler = false;
    }
}

module.exports = Player