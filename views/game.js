const socket = io(location.href);

const playersContainer = document.querySelector('.players-container');

function removeAllChildren(element){
    while (element.lastElementChild) {
        element.removeChild(element.lastElementChild);
    }
}

function createModalWindow(title){
    const popup = document.createElement('div');
    popup.classList.add('popup');
    const popupBody = document.createElement('div');
    popup.classList.add('popup-body');
    popup.appendChild(popupBody);
    const popupContent = document.createElement('form');
    popupContent.classList.add('popup-content');
    popupBody.appendChild(popupContent);
    const popupTitle = document.createElement('popup-title');
    popupTitle.innerText = title;
    popupTitle.classList.add('popup-title');
    popupContent.appendChild(popupTitle);
    const submit = document.createElement('input');
    submit.type = 'submit';
    popupContent.appendChild(submit);
    return popup;
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

function createCardsModalWindow(cards, windowTitle, socketEventTag){
    const modalWindow = createModalWindow(windowTitle);
    const submit = modalWindow.querySelector('input[type=submit]');
    const cardsContainer = document.createElement('div');
    cardsContainer.classList.add('cards-container');
    for (let law of cards){
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.required = true;
        radio.name = 'choosenCard';
        radio.type = law.type;
        const img = document.createElement('img');
        img.src = law.src;
        cardsContainer.appendChild(radio);
    }

    const form = modalWindow.querySelector('.popup-content');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        socket.emit(socketEventTag, JSON.stringify({
            payload: {
                choosenLaw: formData.get('choosenCard');
            }
        }));
    });
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

socket.on('choosingLaw', data => {
    const payload = JSON.parse(data).payload;

})