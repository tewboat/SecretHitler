const LawField = require('./lawField');
const LawDeck = require('./lawDecks');

class GameState{
    constructor(playersCount, players) {
        this.playersCount = playersCount;
        this.players = players;
        this.field = new LawField(playersCount);
        this.decks = new LawDeck();

        this.lastPresident = null;
        this.lastChancellor = null;
        // choose somebody to love;
        this.currentPresident = null;
        this.currentChancellor = null;

        this.skipPawn = 0;

    }

    getRandomPlayer(condition){
        let rand = Math.floor(Math.random() *  this.playersCount);
    }

    generatePlayersRoles(){
        //const shuffled = array.sort(() => 0.5 - Math.random());
        //let selected = shuffled.slice(0, n);
        if (this.playersCount === 5 || this.playersCount === 6){
            // 1 fs + 1 H
        }
        else if (this.playersCount === 7 || this.playersCount === 8){
            // 2 fs + 1 H
        }
        else if (this.playersCount === 9 || this.playersCount === 10){
            // 3 fs + 1 H
        }
        else throw new Error('invalid count of players');
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
    }

    randomLawEvent(){

    }

    electiosEvent(){

    }
}