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

const server = http.createServer(app);
const io = socketIO(server);


const rooms = new Map();


app.get('/', ((req, res) => {
    res.sendFile(path.join(__dirname, '/views', 'menu.html'));
}))

app.get('/enter', (req, res) => {
    let roomUid = req.query.roomUid;
    let room = rooms.get(roomUid);
    //todo сгенерить и отправить темплэйт комнаты
})

app.post('/create', (req, res) => {
    let password = req.body.password;
    let maxPlayersCount = req.body.maxPlayersCount;
    let room = new Room(password, maxPlayersCount);
    rooms.set(room.id, room);
    res.redirect(`http://localhost:${PORT}/enter`)
})

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
