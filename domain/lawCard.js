require('./constants')
// tested
class LawCard{
    constructor(cardType){
        this.type = cardType; // TODO should be Party enum(Liberal or Fascist); already Party;
    }
}

module.exports = LawCard;