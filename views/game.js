const socket = io(location.href);

// TODO вынести в отдельный вспомогательный файл
function getCookie(name) {
    let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

socket.emit('joinRoom', JSON.stringify({
    payload: {
        nickname: getCookie('nickname')
    }
}));

socket.on('playerJoined', data => {
    console.log(data);
});