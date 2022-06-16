const types = require('./constants');

class FascistField {
    constructor(playerCount) {
        //this.playerCount = playerCount;
        this.iterator = 0;
        if (playerCount === 5 || playerCount === 6) {
            this.events = [
                null,
                null,
                this.showDeck];
        } else if (playerCount === 7 || playerCount === 8) {
            this.events = [
                null,
                this.showPlayerParty,
                this.chooseNextPresident];
        } else if (playerCount === 9 || playerCount === 10) {
            this.events = [
                this.showPlayerParty,
                this.showPlayerParty,
                this.chooseNextPresident];
        } else throw new Error('invalid players count');

        this.events.push(this.killSomebody);
        this.events.push(this.killSomebodyAndVeto);
        this.events.push(this.fascistWin);
    }


    getNextEvent(){
        // TODO fix this.events[this.iterator++]();
    }

    showDeck() {

    }


    showPlayerParty() {

    }

    chooseNextPresident() {

    }

    killSomebody() {

    }

    killSomebodyAndVeto() {
        this.killSomebody();

    }

    fascistWin() {

    }
}

class LiberalField{
    constructor() {
        this.lawCount = 0;
    }

    getNextEvent(){
        this.lawCount++;
        if (this.lawCount === 5) this.LiberalWinEvent();
    }

    LiberalWinEvent(){

    }
}

class LawsField {
    constructor(playerCount) {
        this.liberalField = new LiberalField();
        this.fascistField = new FascistField(playerCount);
    }

    addLaw(law) {
        if (law === types.Party.Liberal) {
            this.liberalField.getNextEvent();
        } else {
            this.fascistField.getNextEvent();
        }
    }
}

module.exports = LawsField;