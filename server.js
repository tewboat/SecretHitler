const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const Room = require('./domain/room.js');
const cookieParser = require('cookie-parser');
const path = require("path");


const PORT = 3000;
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "views")));

const server = http.createServer(app);
const io = socketIO(server);
const rooms = new Map();

function validateNickname(nickname){
    const nicknameMaxLength = 15;
    return 0 < nickname.length < nicknameMaxLength; // TODO сделать проверку уникальности
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views', 'menu.html'));
})

app.post('/setName', (req, res) => {
    let nickname = String(req.body.payload.nickname);
    if (validateNickname(nickname)){
        res.cookie('nickname', nickname);
        res.sendStatus(200);
    }
    else {
        res.sendStatus(422);
    }
})

app.get('/enter', (req, res) => {
    let id = req.query.id;
    let room = rooms.get(id);
    res.json(room);
});

app.post('/create', (req, res) => {
    let password = req.body.password;
    let maxPlayersCount = req.body.maxPlayersCount;
    let room = new Room(password, maxPlayersCount);
    rooms.set(room.id, room);
    console.log(room);
    res.redirect(`http://localhost:${PORT}/enter?id=${room.id}`)
});

app.get('/find', ((req, res) => {
    const result = [];
    for (let room of rooms){
        result.push(room);
    }
    res.json(result);
}));

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
