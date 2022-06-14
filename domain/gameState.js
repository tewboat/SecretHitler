const LawField = require('./lawField');
const LawDeck = require('./lawDecks');
const types = require('./constants');

class GameState{
    constructor(playersCount, players) {
        this.playersCount = playersCount;
        this.players = players;
        this.field = new LawField(playersCount);
        this.decks = new LawDeck();
        this.generatePlayersRoles();

        this.lastPresident = null;
        this.lastChancellor = null;
        // choose somebody to love;
        this.currentPresident = players[0];
        this.currentChancellor = players[1];
        this.skipPawn = 0;

        // TODO start game

    }

    // TODO useless method
    getRandomPlayer(condition){
        let rand = Math.floor(Math.random() *  this.playersCount);
    }

    generatePlayersRoles(){
        let unusedSz = this.playersCount;
        let randHt = Math.floor(Math.random() *  unusedSz);
        this.players[randHt].party = types.Party.Fascist;
        this.players[randHt].isHitler = true;
        unusedSz--;

        let fascistCount = -1;
        if (this.playersCount === 5 || this.playersCount === 6)
            fascistCount = 1;
        else if (this.playersCount === 7 || this.playersCount === 8)
            fascistCount = 2;
        else if (this.playersCount === 9 || this.playersCount === 10)
            fascistCount = 3;
        else throw new Error('invalid count of players');

        for(let f = 0; f < fascistCount; f++){
            let randFs = Math.floor(Math.random() *  unusedSz);
            let i = 0;
            while(true){
                if (this.players[i].party === undefined) {
                    if (randFs === 0){
                        this.players[i].party = types.Party.Fascist;
                        break;
                    }
                    randFs--;
                }
                i++;
                i %= this.playersCount;
            }
            unusedSz--;
        }
        let srcFC = 1;
        let srcLC = 1;
        for(let i = 0; i < this.playersCount; i++) {
            this.players[i].src = 'images/rolesCards/';
            if (this.players[i].party === undefined) {
                this.players[i].party = types.Party.Liberal;
                this.players[i].src += this.players[i].party.toLowerCase() + '_' + srcLC + '.png';
                srcLC++;
            }
            else{
                if (this.players[i].isHitler){
                    this.players[i].src += 'hitler.png'
                }
                else {
                    this.players[i].src += this.players[i].party.toLowerCase() + '_' + srcFC + '.png';
                    srcFC++;
                }
            }
        }
    }

    updateSkipPawn(wasSkipped){
        if (wasSkipped === true) {
            this.skipPawn++;
            if (this.skipPawn === 3) {
                this.randomLawEvent();
                this.skipPawn = 0;
            }
        }
        else this.skipPawn = 0;
        // TODO add skipPawn change on players
    }

    randomLawEvent(){

    }

    chooseChancellorEvent()
    {

    }

    electiosEvent(){

    }
}

module.exports = GameState;