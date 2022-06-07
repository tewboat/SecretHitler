require('./constants')

class LawCard{
    constructor(cardType){
        this.type = cardType; // TODO should be Party enum(Liberal or Fascist);
    }
}

module.exports = LawCard;