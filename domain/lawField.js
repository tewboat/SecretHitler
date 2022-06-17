const types = require('./constants');

class FascistField {
    constructor(playerCount) {
        //this.playerCount = playerCount;
        this.lawCount = 0;
        if (playerCount === 5 || playerCount === 6) {
            this.events = [
                types.Action.ShowDeck,
                null,
                types.Action.ShowDeck];
        } else if (playerCount === 7 || playerCount === 8) {
            this.events = [
                null,
                types.Action.ShowPlayerParty,
                types.Action.SetNextPresident];
        } else if (playerCount === 9 || playerCount === 10) {
            this.events = [
                types.Action.ShowPlayerParty,
                types.Action.ShowPlayerParty,
                types.Action.SetNextPresident];
        } else throw new Error('invalid players count');

        this.events.push(types.Action.KillPlayer);
        this.events.push(types.Action.KillPlayer);
    }


    addLaw() {
        this.lawCount++;
        // TODO fix this.events[this.iterator++]();
    }

    getAction(){
        return this.events[this.lawCount - 1];
    }
}

class LiberalField{
    constructor() {
        this.lawCount = 0;
    }

    addLaw(){
        this.lawCount++;
    }
}

class LawsField {
    constructor(playerCount) {
        this.liberalField = new LiberalField();
        this.fascistField = new FascistField(playerCount);
    }

    addLaw(law) {
        if (law.type === types.Party.Liberal) {
            this.liberalField.addLaw();
        } else {
            this.fascistField.addLaw();
        }
    }
}

module.exports = LawsField;