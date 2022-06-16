const socket = io(location.href);

const playersContainer = document.querySelector('.players-container');

const defaultPlayerImage = 'images/rolesCards/card_shirt.png';

let fieldGenerated = false;

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
    submit.value = 'Принять';
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
        radio.value = law.type;
        const img = document.createElement('img');
        img.src = law.src;
        radio.appendChild(img);
        cardsContainer.appendChild(radio);
    }
    modalWindowForm.querySelector('.modal-window-submit').before(cardsContainer);

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

function createElectionModalWindow(players) {
    const modalWindow = createModalWindow();
    const modalWindowForm = createModalWindowForm('Выберите кандидата в канцлеры');
    modalWindow.querySelector('.popup-body').appendChild(modalWindowForm);
    const submit = modalWindowForm.querySelector('.modal-window-submit');
    const container = document.createElement('ul');
    container.classList.add('election-list');
    for (let player of players) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'chosenPlayerId';
        radio.id = player.id;
        radio.value = player.id;
        radio.required = true;
        const label = document.createElement('label');
        label.htmlFor = player.id;
        label.innerText = player.nickname;
        const li = document.createElement('li');
        li.append(radio, label);
        container.append(li);
    }
    submit.before(container);
    modalWindowForm.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        socket.emit('chancellorElected', JSON.stringify({
            payload: {
                id: formData.get('chosenPlayerId')
            }
        }));
        document.body.removeChild(modalWindow);
    });

    return modalWindow;
}

function updatePlayersList(players) {
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
    if (!fieldGenerated) {
        const maxPlayersCount = payload.maxPlayersCount;
        const table = document.querySelector('.fascist');
        table.style.width = '318px';
        if (maxPlayersCount >= 7) {
            const f3 = document.getElementById('f3');
            const f2 = document.createElement('td');
            f2.id = 'f2';
            f3.before(f2);
            table.style.width = '394px';
        }
        if (maxPlayersCount >= 9) {
            const f2 = document.getElementById('f2');
            const f1 = document.createElement('td');
            f1.id = 'f1';
            f2.before(f1);
            table.style.width = '470px';
        }

        fieldGenerated = true;
    }
    updatePlayersList(payload.players);
});

socket.on('start', data => {
    const payload = JSON.parse(data).payload;
    const players = payload.players;

    updatePlayersList(players);
    const modalWindow = createModalWindow();
    const title = document.createElement('h4');
    title.innerText = 'Ваша роль';
    const role = document.createElement('p');
    role.innerText = payload.role;
    const president = document.createElement('p');
    president.innerText = `Президентом назначен ${payload.president}`;
    modalWindow.querySelector('.popup-body').append(title, role, president);
    document.body.appendChild(modalWindow);
    setTimeout(() => document.body.removeChild(modalWindow), 5000);
});

socket.on('chancellorElection', data => {
    const payload = JSON.parse(data).payload;
    const modalWindow = createElectionModalWindow(payload.players);
    document.body.appendChild(modalWindow);
});

socket.on('choosingLaw', data => {
    const payload = JSON.parse(data).payload;
});

socket.on('readinessСheck', () => {
    const modalWindow = createReadyCheckModalWindow();
    document.body.appendChild(modalWindow);
});