const socket = io(location.href);

// TODO вынести в отдельный вспомогательный файл
function getCookie(name) {
    let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

const playersContainer = document.querySelector('.players-container');

socket.emit('joinRoom', JSON.stringify({
    payload: {
        nickname: getCookie('nickname')
    }
}));

socket.on('playerJoined', data => {
    const payload = JSON.parse(data).payload;
    playersContainer.innerHTML = '';
    for (let player of payload.players){
        const p = document.createElement('p');
        p.innerText = player.nickname;
        playersContainer.appendChild(p);
    }
});