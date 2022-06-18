const express = require('express');
const {Server} = require('socket.io');
const Room = require('./domain/room.js');
const cookieParser = require('cookie-parser');
const path = require("path");
const http = require('http');


const PORT = process.env.PORT || 3000;
const app = express();


const redirectToLoginPage = function (req, res, next) {
    if (req.cookies.nickname === undefined && req.path !== '/' && !req.path.startsWith('/api')) {
        res.redirect('/');
    }
    next();
}

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "views")));
app.use(redirectToLoginPage);
app.enable('trust proxy')

const server = http.createServer(app);
const io = new Server(server);
const rooms = new Map(); // map<uid, room>

function validateNickname(nickname) {
    const nicknameMaxLength = 16;
    return 0 < nickname.length && nickname.length < nicknameMaxLength;
}

function escape(string) {
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    return string.replace(/[&<>"']/g, function (match) {
        return htmlEscapes[match];
    });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views', 'menu.html'));
});

app.get('/rules', (req, res) => {
    res.sendFile(path.join(__dirname, '/views', 'rules.html'));
});

app.post('/api/setName', (req, res) => {
    let nickname = escape(String(req.body.nickname));
    if (validateNickname(nickname)) {
        res.cookie('nickname', nickname);
        res.sendStatus(200);
    } else {
        res.sendStatus(422);
    }
});

app.get('/api/getAllRooms', (req, res) => {
    const result = []
    rooms.forEach((value, key) => {
            if (!value.isGameStarted() && !value.isFull()) {
                result.push({
                    id: key,
                    name: value.name,
                    password: value.password !== undefined,
                    playersCount: value.players.length,
                    maxPlayersCount: value.maxPlayersCount
                })
            }
        }
    );
    res.json(result);
});

app.post('/enter', (req, res) => {
    const id = req.body.id;
    const password = req.body.password || undefined;

    const room = rooms.get(id);

    if (room === undefined || password !== room.password || room.isFull()) {
        res.status(403);
    }

    res.sendFile(path.join(__dirname, 'views', 'game.html'));
});

function validateRoomParameters(name, password, playersCount) {
    return name !== undefined && 1 <= name.length && name.length <= 16
        && !isNaN(playersCount) && 5 <= playersCount && playersCount <= 10
        && (password === undefined || (4 <= password.length && password.length <= 16));
}

app.post('/api/createRoom', (req, res) => {
    const name = escape(req.body.name);
    const password = req.body.password || undefined;
    const playersCount = Number(req.body.playersCount);

    if (!validateRoomParameters(name, password, playersCount)) {
        res.sendStatus(422);
        return;
    }

    let room = new Room(name, password, playersCount);
    rooms.set(room.id, room);

    res.json({id: room.id});
});

io.on('connection', ws => {
    const roomId = ws.handshake.query.id;
    const room = rooms.get(roomId);

    if (room === undefined) {
        ws.disconnect();
        return;
    }

    ws.on('joinRoom', msg => {
        const payload = JSON.parse(msg).payload;
        room.addPlayer(payload.nickname, ws);
        const players = room.getPlayersList();
        room.notifyPlayers('playersListUpdated', JSON.stringify({
            payload: {
                players: players,
                maxPlayersCount: room.maxPlayersCount,
                roomName: room.name,
            }
        }), _ => true);

        if (room.players.length === room.maxPlayersCount) {
            room.notifyPlayers('readinessCheck', null, () => true);
        }
    });

    ws.on('ready', () => {
        if (room.setReady(ws.id)) {
            setTimeout(() => room.runGame(), 1000);
        }
    });

    ws.on('chancellorElected', data => {
        const payload = JSON.parse(data).payload;
        room.gameState.setChancellorCandidate(payload.id);
        room.gameState.voting();
    })

    ws.on('voted', data => {
        const payload = JSON.parse(data).payload;
        room.gameState.setVote(ws.id, payload.value);

        if (room.gameState.allVoted()) {
            room.gameState.onElectionResult();
        }
    });

    ws.on('presidentLawChosen', data => {
        const payload = JSON.parse(data).payload;
        room.gameState.removeLaw(payload.value);
        room.gameState.chancellorLawChoosing();
    });

    ws.on('chancellorLawChosen', data => {
        const payload = JSON.parse(data).payload;
        room.gameState.removeLaw(payload.value);
        room.gameState.adoptLaw(room.gameState.laws[0]);
    });

    ws.on('showPlayerPartyAction', data => {
        const payload = JSON.parse(data).payload;
        room.gameState.showPlayerParty(payload.id);
    });

    ws.on('setNextPresidentAction', data => {
        const payload = JSON.parse(data).payload;
        room.gameState.setNextPresident(payload.id);

    });

    ws.on('playerKilled', data => {
        const payload = JSON.parse(data).payload;
        room.gameState.killPlayer(payload.id);

    });

    ws.on('disconnect', () => {
        room.removePlayer(ws.id);
        if (room.players.length === 0) {
            rooms.delete(room.id);
            return;
        }
        if (room.isGameStarted()) {
            room.gameState.sendPlayersGameList('playersListUpdated');
        } else {
            const players = room.getPlayersList();
            room.notifyPlayers('playersListUpdated', JSON.stringify({
                payload: {
                    players: players
                }
            }), () => true);
        }
    });
});

server.listen(PORT, () => {
    console.log(`https://localhost:${PORT}`)
})