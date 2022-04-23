

let uri = ''
let webSocket = WebSocket(uri);

let rooms = new Map();

class Room{
    id;
    name;
    maxPlayers;
    players = [];

    constructor(roomName, maxPlayers) {
        this.id = this.generateId()
        this.name = roomName;
        this.maxPlayers = maxPlayers;
    }

    generateId() {
        return undefined; //todo сделать генерацию уникального идентификатора
    }
}

function validateName(){
    return true; //todo проверить валидность имени
}

function createRoom(roomName, maxParticipants){
    if (!validateName(roomName))
        return; //todo отправлять error_message клиенту
    let room = new Room(roomName);
    rooms.set(room.id, room);
    //todo перенаправить в созданнную комнату
}

function getRoom(id){
    //todo отправка значения клиенту
    return rooms.get(id);
}

