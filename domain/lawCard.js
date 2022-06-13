require('./constants')
// tested TODO add exports
class LawCard{
    constructor(cardType){
        if (cardType === Party.Fascist || cardType === Party.Liberal)
            this.type = cardType; // TODO should be Party enum(Liberal or Fascist); already Party;
        else throw new Error('invalid cardType to create');
    }
}

module.exports = LawCard;