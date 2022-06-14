const socket = io(location.href);

const playersContainer = document.querySelector('.players-container');

const defaultPlayerImage = 'images/rolesCards/card_shirt.png';

function removeAllChildren(element) {
    while (element.lastElementChild) {
        element.removeChild(element.lastElementChild);
    }
}

function createModalWindow() {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    const popupBody = document.createElement('div');
    popupBody.classList.add('popup-body');
    popup.appendChild(popupBody);
    return popup;
}

function createModalWindowForm(title) {
    const popupContent = document.createElement('form');
    popupContent.classList.add('popup-content');
    const popupTitle = document.createElement('div');
    popupTitle.innerText = title;
    popupTitle.classList.add('popup-title');
    popupContent.appendChild(popupTitle);
    const submit = document.createElement('input');
    submit.type = 'submit';
    submit.classList.add('modal-window-submit');
    popupContent.appendChild(submit);
    return popupContent;
}

function createPlayerCard(player) {
    const div = document.createElement('div');
    div.classList.add('player');
    const img = document.createElement('img');
    img.src = player.src || defaultPlayerImage;
    img.alt = 'Role card shirt';
    img.classList.add('role-card');
    div.appendChild(img);
    const name = document.createElement('strong');
    name.innerText = player.nickname;
    div.appendChild(name);
    return div;
}

function createCardsModalWindow(cards, windowTitle, socketEventTag) {
    const modalWindow = createModalWindow();
    const modalWindowForm = createModalWindowForm(windowTitle);
    modalWindow.querySelector('.popup-body').appendChild(modalWindowForm);
    const cardsContainer = document.createElement('div');
    cardsContainer.classList.add('cards-container');
    for (let law of cards) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.required = true;
        radio.name = 'chosenCard';
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
                chosenLaw: formData.get('chosenCard')
            }
        }));
    });

    return modalWindow;
}

function createReadyCheckModalWindow() {
    const modalWindow = createModalWindow();
    const modalWindowBody = modalWindow.querySelector('.popup-body');
    const title = document.createElement('div');
    title.classList.add('popup-title');
    title.innerText = 'Подтвердите готовность';
    modalWindowBody.appendChild(title);
    const button = document.createElement('input');
    button.type = 'button';
    button.value = 'Готов(а)';
    button.classList.add('modal-window-submit');
    button.addEventListener('click', _ => {
        socket.emit('ready', JSON.stringify({
            payload: {
                ready: true
            }
        }));
        document.body.removeChild(modalWindow);
    });
    modalWindowBody.appendChild(button);
    return modalWindow;
}

function updatePlayersList(players){
    removeAllChildren(playersContainer);
    for (let player of players) {
        const playerCard = createPlayerCard(player);
        playersContainer.appendChild(playerCard);
    }
}

socket.emit('joinRoom', JSON.stringify({
    payload: {
        nickname: getCookie('nickname')
    }
}));

socket.on('playersListUpdated', data => {
    const payload = JSON.parse(data).payload;
    updatePlayersList(payload.players);
});

socket.on('start', data => {
    const payload = JSON.parse(data).payload;
    updatePlayersList(payload.players);
});

socket.on('choosingLaw', data => {
    const payload = JSON.parse(data).payload;
});

socket.on('readinessСheck', () => {
    const modalWindow = createReadyCheckModalWindow();
    document.body.appendChild(modalWindow);
});