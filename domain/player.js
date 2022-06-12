require('./constants')

class Player{
    constructor(nickname){
        this.nickname = nickname;
        this.role = undefined; //Role.Player;
        this.party = undefined; //Party.Liberal;
        this.isHitler = false;
    }
}

module.exports = Player