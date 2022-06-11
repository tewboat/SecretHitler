const socket = io(location.href);

socket.emit('joinRoom', document.cookie);

