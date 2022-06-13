const types = require('./constants');

class Player{
    constructor(nickname){
        this.nickname = nickname;
        this.role = types.Role.Player;
        this.party = types.Party.Liberal;
        this.isHitler = false;
    }
}

module.exports = Player