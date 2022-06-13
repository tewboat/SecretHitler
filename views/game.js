const socket = io(location.href);

const playersContainer = document.querySelector('.players-container');

socket.emit('joinRoom', JSON.stringify({
    payload: {
        nickname: getCookie('nickname')
    }
}));

socket.on('playersListUpdated', data => {
    const payload = JSON.parse(data).payload;
    playersContainer.innerHTML = '';
    for (let player of payload.players){
        const p = document.createElement('p');
        p.innerText = player.nickname;
        playersContainer.appendChild(p);
    }
});