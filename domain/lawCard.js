require('./constants')

class LawCard{
    constructor(cardType){
        this.type = cardType; // should be Party enum(Liberal or Fascist);
    }
}

module.exports = LawCard;