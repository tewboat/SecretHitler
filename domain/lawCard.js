const types = require('./constants');

class LawCard{
    constructor(cardType){
        if (cardType === types.Party.Fascist || cardType === types.Party.Liberal)
            this.type = cardType;
        else throw new Error('invalid cardType to create');
    }
}

module.exports = LawCard;