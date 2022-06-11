const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Room = require('./domain/room.js');
const cookieParser = require('cookie-parser');
const path = require("path");


const PORT = 3000;
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
})

app.post('/api/setName', (req, res) => {
    let nickname = escape(String(req.body.nickname));
    if (validateNickname(nickname)) {
        res.cookie('nickname', nickname);
        res.sendStatus(200);
    } else {
        res.sendStatus(422);
    }
})

app.get('/api/getAllRooms', (req, res) => {
    const result = []
    rooms.forEach((value, key) => {
        result.push({
            id: key,
            name: value.name,
            password: value.password !== undefined,
            playersCount: value.players.size,
            maxPlayersCount: value.maxPlayersCount
        })
    })
    res.json(result);
})

app.post('/enter', (req, res) => {
    const id = req.body.id;
    const password = req.body.password;

    const room = rooms.get(id);

    if (password !== room.password || room.isFull()){
        res.status(403);
    }

    res.sendFile(path.join(__dirname, 'views', 'game.html'));
});

function validateRoomParameters(name, password, playersCount){
    return name !== undefined && 1 <= name.length <= 16
    && !isNaN(playersCount) && 5 <= playersCount <= 10
    && (password === undefined || password === null || 4 <= password.length <= 16);
}

app.post('/api/createRoom', (req, res) => {
    const name = escape(req.body.name);
    const password = req.body.password;
    const playersCount = Number(req.body.playersCount);

    if (!validateRoomParameters(name, password, playersCount)){
        res.sendStatus(422);
        return;
    }

    let room = new Room(name, password, playersCount);
    rooms.set(room.id, room);

    res.json({id: room.id});
});

io.on('connection', (ws) => {
    console.log(ws.handshake.query.id);
    ws.on('joinRoom', msg => {
        console.log('joined');
        // TODO send updated list of players
    })
});


server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})