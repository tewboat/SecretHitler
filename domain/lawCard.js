const types = require('./constants');

class LawCard {
    constructor(cardType) {
        if (cardType === types.Party.Fascist || cardType === types.Party.Liberal)
            this.type = cardType;
        switch (cardType) {
            case types.Party.Fascist:
                this.src = 'views/images/'; //TODO
                break;
            case types.Party.Liberal:
                this.src = 'views/images/'; //TODO
                break;
        }
    else
        throw new Error('invalid cardType to create');
    }
}

module.exports = LawCard;