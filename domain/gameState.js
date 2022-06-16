const LawField = require('./lawField');
const LawDeck = require('./lawDecks');
const types = require('./constants');
const Const = require("./constants");
const e = require("express");

class GameState {
    constructor(playersCount, players) {
        this.playersCount = playersCount;
        this.players = players;
        this.field = new LawField(playersCount);
        this.decks = new LawDeck();
        this.generatePlayersRoles();

        this.lastPresident = null;
        this.lastChancellor = null;

        this.currentPresident = players[0];
        this.currentChancellor = players[1];
        this.skipPawn = 0;
    }

    generatePlayersRoles() {
        let unusedSz = this.playersCount;
        let randHt = Math.floor(Math.random() * unusedSz);
        this.players[randHt].party = types.Party.Fascist;
        this.players[randHt].isHitler = true;
        unusedSz--;

        let fascistCount = -1;
        if (this.playersCount === 5 || this.playersCount === 6)
            fascistCount = 1;
        else if (this.playersCount === 7 || this.playersCount === 8)
            fascistCount = 2;
        else if (this.playersCount === 9 || this.playersCount === 10)
            fascistCount = 3;
        else throw new Error('invalid count of players');

        for (let f = 0; f < fascistCount; f++) {
            let randFs = Math.floor(Math.random() * unusedSz);
            let i = 0;
            while (true) {
                if (this.players[i].party === undefined) {
                    if (randFs === 0) {
                        this.players[i].party = types.Party.Fascist;
                        break;
                    }
                    randFs--;
                }
                i++;
                i %= this.playersCount;
            }
            unusedSz--;
        }
        let srcFC = 1;
        let srcLC = 1;
        for (let i = 0; i < this.playersCount; i++) {
            this.players[i].src = 'images/rolesCards/';
            if (this.players[i].party === undefined) {
                this.players[i].party = types.Party.Liberal;
                this.players[i].src += this.players[i].party.toLowerCase() + '_' + srcLC + '.png';
                srcLC++;
            } else {
                if (this.players[i].isHitler) {
                    this.players[i].src += 'hitler.png'
                } else {
                    this.players[i].src += this.players[i].party.toLowerCase() + '_' + srcFC + '.png';
                    srcFC++;
                }
            }
        }
    }

    notifyPlayers(tag, message, selector = () => true) {
        for (let player of this.players) {
            if (selector(player)) {
                player.socket.emit(tag, message);
            }
        }
    }

    getPlayersInfoList(selector) {
        const playersInfo = [];
        for (let player of this.players) {
            playersInfo.push(selector(player));
        }
        return playersInfo;
    }

    sendPlayersGameList(){
        const fascistList = this.getPlayersInfoList(player => {
            return {
                role: player.role,
                src: player.src,
                nickname: player.nickname
            }
        });

        this.notifyPlayers('start', JSON.stringify({
            payload: {
                president: this.currentPresident.nickname,
                role: 'Фашист',
                players: fascistList
            }
        }), player => player.party === Const.Party.Fascist);

        let hilterList;
        if (this.playersCount <= 6) {
            hilterList = fascistList;
        } else {
            hilterList = this.getPlayersInfoList(player => {
                if (player.isHitler) {
                    return {
                        role: player.role,
                        src: player.src,
                        nickname: player.nickname
                    }
                }
                return {
                    role: player.role,
                    src: 'images/rolesCards/card_shirt.png',
                    nickname: player.nickname
                }
            });
        }

        this.notifyPlayers('start', JSON.stringify({
            payload: {
                president: this.currentPresident.nickname,
                role: 'Гитлер',
                players: hilterList
            }
        }), player => player.isHitler);

        for (let player of this.players) {
            if (player.party !== Const.Party.Liberal) continue;
            const list = this.getPlayersInfoList(p => {
                if (player === p) {
                    return {
                        role: p.role,
                        src: p.src,
                        nickname: p.nickname
                    }
                }
                return {
                    role: player.role,
                    src: 'images/rolesCards/card_shirt.png',
                    nickname: p.nickname
                }
            });

            this.notifyPlayers('start', JSON.stringify({
                payload: {
                    president: this.currentPresident.nickname,
                    role: 'Либерал',
                    players: list
                }
            }), p => p === player);
        }

    }

    run() {
        this.sendPlayersGameList();
        setTimeout(() => this.electionEvent(), 6000);
    }

    electionEvent() {
        const playersList = [];
        for (let player of this.players) {
            if ([this.lastPresident, this.lastChancellor, this.currentPresident].includes(player)) {
                continue;
            }

            playersList.push({
                id: player.socketID,
                nickname: player.nickname
            });
        }

        this.currentPresident.socket.emit('chancellorElection', JSON.stringify({
            payload: {
                players: playersList
            }
        }));
    }

    voting() {
        this.votes = new Map();
        this.notifyPlayers('voting', JSON.stringify({
            payload: {
                chancellorNickname: this.currentChancellor.nickname,
                chancellorID: this.currentChancellor.socketID
            }
        }));
    }

    setVote(id, vote) {
        if (this.votes === undefined) {
            return;
        }

        this.votes.set(id, vote)
    }

    allVoted() {
        return this.votes.size === this.players.length;
    }

    setChancellor(id) {
        for (let player of this.players) {
            if (player.socketID === id) {
                this.currentChancellor = player;
                return;
            }
        }
    }

    onElectionResult() {
        let ja = 0;
        let nein = 0;
        for (let vote of this.votes) {
            ja += vote[1] === 'ja';
            nein += vote[1] === 'nein';
        }

        const electionResults = [];
        this.players.forEach(player => {
            electionResults.push(this.votes.get(player.socketID));
        });

        this.notifyPlayers('electionResults', JSON.stringify({
            payload: {
                results: electionResults
            }
        }));

        setTimeout(() => {
            if (ja > nein) {
                this.presidentLawChoosing();
                this.skipPawn = 0;
            } else {
                this.skipPawn++;
                if (this.skipPawn === 3) {
                    this.skipPawn = 0;
                    const law = this.getLaws(1)[0];
                    this.adoptLaw(law, true);
                    setTimeout(() => this.nextMove(), 1000);
                } else {
                    this.notifyPlayers('skip', JSON.stringify({
                        skipped: this.skipPawn
                    }), () => true);
                    setTimeout(() => this.electionEvent(), 1000);
                }
            }
        }, 3000);
    }

    removeLaw(type) {
        for (let i = 0; i < this.laws.length; i++) {
            if (this.laws[i].type === type) {
                this.laws.splice(i, 1);
                this.decks.discardCard(this.laws[i]);
                return;
            }
        }
    }

    getLaws(num){
        const laws = [];
        for (let i = 0; i < num; i++){
            laws.push(this.decks.getTopCard());
        }
        return laws;
    }

    presidentLawChoosing() {
        this.laws = this.getLaws(3);
        this.currentPresident.socket.emit('presidentLawChoosing', JSON.stringify(
            {
                payload: {
                    laws: this.laws
                }
            }
        ));
    }

    chancellorLawChoosing() {
        this.currentChancellor.socket.emit('chancellorLawChoosing', JSON.stringify(
            {
                payload: {
                    laws: this.laws
                }
            }
        ))
    }

    adoptLaw(law, ignoreAction = false) {
        this.field.addLaw(law);
        this.notifyPlayers('lawAdopted', JSON.stringify({
            law: law
        }));
        if (!ignoreAction) {
            setTimeout(() => {
                this.currentPresident.socket.emit('action', JSON.stringify({
                    payload: {
                        action: 'kill' // TODO
                    }
                }));
            }, 3000);
        }
    }

    nextMove() {
        // TODO сменить президента
        const infoList = this.getPlayersInfoList(player => {
            return {
                president: player === this.currentPresident,
                chancellor: player === this.currentChancellor,
                nickname: player.nickname
            }
        });
    }

}

module.exports = GameState;