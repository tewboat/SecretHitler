const socket = io(location.href);

const playersContainer = document.querySelector('.players-container');

function removeAllChildren(element){
    while (element.lastElementChild) {
        element.removeChild(element.lastElementChild);
    }
}

function createPlayerCard(player){
    const div = document.createElement('div');
    div.classList.add('player');
    const img = document.createElement('img');
    img.src = 'images/rolesCards/card_shirt.png';
    img.alt = 'Role card shirt';
    img.classList.add('role-card');
    div.appendChild(img);
    const name = document.createElement('strong');
    name.innerText = player.nickname;
    div.appendChild(name);
    return div;
}

socket.emit('joinRoom', JSON.stringify({
    payload: {
        nickname: getCookie('nickname')
    }
}));

socket.on('playersListUpdated', data => {
    const payload = JSON.parse(data).payload;
    removeAllChildren(playersContainer);
    for (let player of payload.players){
        const playerCard = createPlayerCard(player);
        playersContainer.appendChild(playerCard);
    }
});