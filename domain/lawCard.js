const types = require('./constants');

class LawCard {
    constructor(cardType) {
        if (cardType === types.Party.Fascist || cardType === types.Party.Liberal) {
            this.type = cardType;
        } else {
            throw new Error('invalid cardType to create');
        }
        switch (cardType) {
            case types.Party.Fascist:
                this.src = 'images/lawCards/fascistLaw.png';
                break;
            case types.Party.Liberal:
                this.src = 'views/images/liberalLaw';
                break;
        }
    }
}

module.exports = LawCard;