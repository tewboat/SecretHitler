const LawField = require('./lawField');
const LawDeck = require('./lawDecks');
const types = require('./constants');
const Const = require("./constants");
const e = require("express");

class GameState {
    constructor(playersCount, players, roomName) {
        this.playersCount = playersCount;
        this.players = players;
        this.field = new LawField(playersCount);
        this.decks = new LawDeck();
        this.generatePlayersRoles();

        this.lastPresident = null;
        this.lastChancellor = null;

        this.currentPresident = players[Math.floor(Math.random() * this.players.length)];
        this.currentPresident.role = Const.Role.President;
        this.currentChancellor = null;
        this.skipPawn = 0;

        this.chancellorCandidate = null;
        this.roomName = roomName;
        this.nextPresident = null;
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

    sendPlayersGameList(tag) {
        const fascistList = this.getPlayersInfoList(player => {
            return {
                role: player.role,
                src: player.src,
                nickname: player.nickname,
                alive: player.isAlive
            }
        });

        this.notifyPlayers(tag, JSON.stringify({
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
                        nickname: player.nickname,
                        alive: player.isAlive
                    }
                }
                return {
                    role: player.role,
                    src: 'images/rolesCards/card_shirt.png',
                    nickname: player.nickname,
                    alive: player.isAlive
                }
            });
        }

        this.notifyPlayers(tag, JSON.stringify({
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
                        nickname: p.nickname,
                        alive: p.isAlive
                    }
                }
                return {
                    role: p.role,
                    src: 'images/rolesCards/card_shirt.png',
                    nickname: p.nickname,
                    alive: p.isAlive
                }
            });

            player.socket.emit(tag, JSON.stringify({
                payload: {
                    president: this.currentPresident.nickname,
                    role: 'Либерал',
                    players: list
                }
            }));
        }

    }

    getPlayerById(playerId) {
        for (let player of this.players) {
            if (player.socketID === playerId) {
                return player;
            }
        }
        return undefined;
    }

    sendMessageToPresident(tag, message) {
        this.currentPresident.socket.emit(tag, message);
    }

    run() {
        this.sendPlayersGameList('start');
        setTimeout(() => this.electionEvent(), 6000);
    }

    electionEvent() {
        const playersList = [];
        for (let player of this.players) {
            if ([this.lastPresident, this.lastChancellor, this.currentPresident].includes(player) || !player.isAlive) {
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
                chancellorNickname: this.chancellorCandidate.nickname,
                chancellorID: this.chancellorCandidate.socketID
            }
        }), player => player.isAlive);
    }

    setVote(id, vote) {
        if (this.votes === undefined) {
            return;
        }

        this.votes.set(id, vote)
    }

    allVoted() {
        let counter = 0;
        this.players.forEach(player => {
            counter += player.isAlive;
        });
        return this.votes.size === counter;
    }

    setChancellorCandidate(id) {
        for (let player of this.players) {
            if (player.socketID === id) {
                this.chancellorCandidate = player;
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
                this.skipPawn = 0;
                if (this.currentChancellor !== null) {
                    this.currentChancellor.role = Const.Role.Player;
                }

                this.currentChancellor = this.chancellorCandidate;
                this.currentChancellor.role = Const.Role.Chancellor;

                if (this.field.fascistField.lawCount >= 3 && this.currentChancellor.isHitler) {
                    this.fascistWin('Гитлер пришел к власти.');
                    return;
                }

                setTimeout(() => this.sendPlayersGameList('playersListUpdated'), 10000);
                setTimeout(() => this.presidentLawChoosing(), 1000);
            } else {
                this.skipPawn++;
                if (this.skipPawn === 3) {
                    this.skipPawn = 0;
                    const law = this.getLaws(1)[0];
                    this.adoptLaw(law, true);
                } else {
                    this.notifyPlayers('skip', JSON.stringify({
                        payload: {
                            skipped: this.skipPawn
                        }
                    }), () => true);
                    setTimeout(() => this.electionEvent(), 1000);
                }
            }
        }, 3000);
    }

    removeLaw(type) {
        for (let i = 0; i < this.laws.length; i++) {
            if (this.laws[i].type === type) {
                this.decks.discardCard(this.laws[i]);
                this.laws.splice(i, 1);
                return;
            }
        }
    }

    getLaws(num) {
        const laws = [];
        for (let i = 0; i < num; i++) {
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
            payload: {
                fascistField: this.field.fascistField.lawCount,
                liberalField: this.field.liberalField.lawCount
            }
        }));

        if (law.type === types.Party.Liberal) {
            if (this.field.liberalField.lawCount === 5) {
                this.liberalWin('Были приняты 5 либеральных законов.');
                return;
            }
            this.nextMove();
            return;
        }

        if (!ignoreAction) {
            if (this.field.fascistField.lawCount === 6) {
                this.fascistWin('Были приняты 6 фашистских законов.');
                return;
            }

            setTimeout(() => this.onAction(this.field.fascistField.getAction(), 3000));
        }
        setTimeout(() => this.nextMove(), 6000);
    }

    showDeckAction() {
        const cards = this.decks.peekTopCards(3);
        this.currentPresident.socket.emit('showDeckAction', JSON.stringify({
            payload: {
                cards: cards
            }
        }));
    }

    showPlayerPartyAction() {
        const players = [];
        this.players.forEach(player => {
            if (player !== this.currentPresident && !player.isChecked) {
                players.push({
                    id: player.socketID,
                    nickname: player.nickname
                });
            }
        });

        this.currentPresident.socket.emit('showPlayerPartyAction', JSON.stringify({
                    payload: {
                        players: players
                    }
                }
            )
        );
    }

    setNextPresident(playerId) {
        for (let player of this.players) {
            if (player.socketID === playerId) {
                this.nextPresident = player;
                return;
            }
        }
    }

    sendAlivePlayersListToPresident(tag) {
        const players = [];
        this.players.forEach(player => {
            if (player !== this.currentPresident && player.isAlive) {
                players.push({
                    id: player.socketID,
                    nickname: player.nickname
                });
            }
        });

        this.currentPresident.socket.emit(tag, JSON.stringify({
                    payload: {
                        players: players
                    }
                }
            )
        );
    }

    killPlayer(id) {
        for (let player of this.players) {
            if (player.socketID === id) {
                player.isAlive = false;
                return player;
            }
        }
    }

    liberalWin(reason) {
        this.notifyPlayers('win', JSON.stringify({
            payload: {
                winner: Const.Party.Liberal,
                reason: reason
            }
        }));
    }

    fascistWin(reason) {
        this.notifyPlayers('win', JSON.stringify({
            payload: {
                winner: Const.Party.Fascist,
                reason: reason
            }
        }));
    }

    onAction(action) {
        switch (action) {
            case Const.Action.KillPlayer:
                this.sendAlivePlayersListToPresident('killPlayerAction');
                break;
            case Const.Action.ShowDeck:
                this.showDeckAction();
                break;
            case Const.Action.SetNextPresident:
                this.sendAlivePlayersListToPresident('setNextPresidentAction');
                break;
            case Const.Action.ShowPlayerParty:
                this.showPlayerPartyAction();
                break;
        }
    }


    nextMove() {
        this.lastPresident = this.currentPresident;
        this.currentPresident.role = Const.Role.Player;
        this.lastChancellor = this.currentChancellor;

        if (this.currentChancellor !== null) {
            this.currentChancellor.role = Const.Role.Player;
            this.currentChancellor = null;
        }

        if (this.nextPresident !== null) {
            this.currentPresident = this.nextPresident;
        } else {
            for (let i = 0; i < this.players.length; i++) {
                if (this.currentPresident === this.players[i]) {
                    const newIndex = (i + 1) % this.players.length;
                    this.currentPresident = this.players[newIndex];
                    break;
                }
            }
        }

        this.currentPresident.role = Const.Role.President;
        this.sendPlayersGameList('playersListUpdated');
        setTimeout(() => this.electionEvent(), 2000);
    }
}

module.exports = GameState;