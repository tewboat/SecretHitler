const types = require('./constants');
const LawCard = require("./lawCard");

class LawDecks{
    constructor(){
        this.discard = [];
        this.mainDeck = [];
        this.generateDeck();
    }

    generateDeck(){
        for(let i = 0; i < 11; i++){
            this.mainDeck.push(new LawCard(types.Party.Fascist));
        }

        for(let i = 0; i < 6; i++){
            this.mainDeck.push(new LawCard(types.Party.Liberal));
        }

        this.shuffleArray(this.mainDeck);
    }

    shuffleArray(array){
        let len = array.length;
        for(let i = 0; i < len * 2; i++){
            let ind1 = Math.floor(Math.random() *  len);
            let ind2 = Math.floor(Math.random() *  len);
            [array[ind1], array[ind2]] = [array[ind2], array[ind1]];
        }
    }

    discardToDeck(){
        while(this.discard.length > 0){
            this.mainDeck.push(this.discard.pop());
        }
    }

    getTopCard(){
        if (this.mainDeck.length === 0 && this.discard.length === 0)
            throw new Error('invalid get top operation');
        if (this.mainDeck.length > 0)
            return this.mainDeck.pop();
        else{
            this.discardToDeck();
            this.shuffleArray(this.mainDeck);
            return this.getTopCard();
        }
    }

    discardCard(card){
        if (card instanceof LawCard)
            this.discard.push(card);
        else throw new Error('invalid cardType to discard');
    }
}

module.exports = LawDecks;