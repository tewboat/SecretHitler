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
    img.classList.add('card');
    div.appendChild(img);
    const name = document.createElement('strong');
    name.innerText = player.nickname;
    div.appendChild(name);
    return div;
}

function showCardsModalWindow(cards, windowTitle, socketEventTag) {
    const modalWindow = createModalWindow();
    const modalWindowForm = createModalWindowForm(windowTitle);
    modalWindow.querySelector('.popup-body').appendChild(modalWindowForm);
    const cardsContainer = document.createElement('div');
    cardsContainer.classList.add('cards-container');
    for (let card of cards) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.required = true;
        radio.name = 'chosenCard';
        radio.value = card.type;
        const img = document.createElement('img');
        img.src = card.src;
        img.classList.add('card');
        const label = document.createElement('label');
        label.append(radio, img);
        cardsContainer.appendChild(label);
    }
    modalWindowForm.querySelector('.modal-window-submit').before(cardsContainer);

    const form = modalWindow.querySelector('.popup-content');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        socket.emit(socketEventTag, JSON.stringify({
            payload: {
                value: formData.get('chosenCard')
            }
        }));
        document.body.removeChild(modalWindow);
    });

    document.body.appendChild(modalWindow);
}

function showReadyCheckModalWindow() {
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
    document.body.appendChild(modalWindow);
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

socket.on('electionResults', data => {
    // todo вывод результатов голосования, перекрасить ход выборов и изменить табличку канцлера
});

socket.on('voting', data => {
    const payload = JSON.parse(data).payload;
    showCardsModalWindow(
        [
            {
                type: 'ja',
                src: 'images/votingCards/ja.png'
            },
            {
                type: 'nein',
                src: 'images/votingCards/nein.png'
            }
        ], `Проголосуйте за назначение игрока ${payload.chancellorNickname} канцлером`,
        'voted'
    );
});

socket.on('presidentLawChoosing', data => {
    const payload = JSON.parse(data).payload;
    showCardsModalWindow(payload.laws, 'Выберите закон для сброса', 'presidentLawChosen');
});

socket.on('chancellorLawChoosing', data => {
    const payload = JSON.parse(data).payload;
    showCardsModalWindow(payload.laws, 'Выберите закон для сброса', 'chancellorLawChosen');
});

socket.on('skip', data => {
    const payload = JSON.parse(data).payload;
    //TODO установить пропущенные ходы payload.skipped
});

socket.on('lawAdopted', data => {
    const payload = JSON.parse(data).payload;
    // todo вставить карточку в поле
});

socket.on();

socket.on('readinessСheck', () => {
    showReadyCheckModalWindow();
});