const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
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
const io = socketIO(server);
const rooms = new Map(); // map<uid, room>

function validateNickname(nickname) {
    const nicknameMaxLength = 15;
    return 0 < nickname.length < nicknameMaxLength; // TODO сделать проверку уникальности
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
    let nickname = escape(String(req.body.payload.nickname));
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
        result.push({uid: key, name: value.name})
    })
    res.json(result);
})

app.get('/api/enter', (req, res) => {
    let id = req.query.id;
    let room = rooms.get(id);
    console.log(room);
    res.json(room);
    // TODO отправка комнаты
});

app.post('/api/createRoom', (req, res) => {
    const payload = req.body.payload;
    const name = payload.name;
    const password = payload.password;
    const playersCount = payload.playersCount;

    // TODO validate
    // TODO сохранять имя

    let room = new Room(password, playersCount);
    rooms.set(room.id, room);
    console.log(room);

    res.json({
        type: 'confirm',
        payload: {
            id: room.id
        }
    });
});

io.on('connection', (socket) => {
    socket.on('onJoin', (data) => {
        let roomUid = data.roomUid;
        let room = rooms.get(roomUid);
        if (room === undefined) {
            socket.emit('onError', {
                message: "No room with such uid."
            });
            socket.disconnect();
            return;
        }
        let name = data.username;

        let pos = room.addPlayer(name, socket);
        room.notifyUsers(function (userSock) {
            userSock.emit('onUserJoined', {
                username: name,
                position: pos
            });
        });
    });
});


server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})