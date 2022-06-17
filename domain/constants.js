class Const {
    static Party = {Liberal: 'Liberal', Fascist: 'Fascist'};
    static Role = {Player: 'Player', Chancellor: 'Chancellor', President: 'President'};
    static Vote = {Ja: 'ja', Nein: 'nein'};
    static Action = {
        ShowPlayerParty: 'showPlayerParty',
        SetNextPresident: 'setNextPresident',
        KillPlayer: 'killPlayer',
        ShowDeck: 'showDeck'
    };
}

module.exports = Const;