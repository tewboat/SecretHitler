

let uri = ''
let webSocket = WebSocket(uri);

let rooms = new Map();


function getRoom(id){
    //todo отправка значения клиенту
    return rooms.get(id);
}

