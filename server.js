const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const constants = require('./constants');

const PORT = 3000;


const app = express()
const server = http.Server(app)
const io = socketIO(server)

app.use('/client', express.static(path.join(__dirname, '/client')))

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'views/index.html'))
})

io.on('connection', socket => {
    socket.on(constants.ADD_NEW_PLAYER, (data, callback) => {

        callback()
    })
})

