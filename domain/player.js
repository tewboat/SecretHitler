require('./constants')

class Player{
    constructor(username){
        this.username = username;
        this.role = Role.Player;
        this.party = Party.Liberal;
        this.isHitler = false;
    }
}

module.exports = Player