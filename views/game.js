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
    const popupTitle = document.createElement('h4');
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
    if (player.role === 'President' || player.role === 'Chancellor') {
        const role = document.createElement('img');
        if (player.role === 'President') {
            role.src = 'images/rolesCards/president.png'
        } else {
            role.src = 'images/rolesCards/chancellor.png'
        }
        role.alt = `${player.role}`;
        role.classList.add('role-card');
        div.appendChild(role);
    }
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
        radio.classList.add('choice-radio');
        const img = document.createElement('img');
        img.src = card.src;
        img.classList.add('vote-card');
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

function showTopCardsModalWindow(cards, windowTitle) {
    const modalWindow = createModalWindow();
    const modalWindowForm = createModalWindowForm(windowTitle);
    const button = modalWindowForm.querySelector('input[type=submit]');
    modalWindowForm.removeChild(button);
    modalWindow.querySelector('.popup-body').appendChild(modalWindowForm);
    const cardsContainer = document.createElement('div');
    cardsContainer.classList.add('cards-container');
    for (let card of cards) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.classList.add('choice-radio');
        const img = document.createElement('img');
        img.src = card.src;
        img.classList.add('vote-card');
        const label = document.createElement('label');
        label.append(radio, img);
        cardsContainer.appendChild(label);
    }

    modalWindowForm.appendChild(cardsContainer);

    modalWindowForm.addEventListener('submit', e => {
        e.preventDefault();
    });

    document.body.appendChild(modalWindow);
    setTimeout(() => document.body.removeChild(modalWindow), 5000);
}

function showWinnerModalWindow(windowTitle) {
    const modalWindow = createModalWindow();
    const modalWindowForm = createModalWindowForm(windowTitle);
    modalWindow.querySelector('.popup-body').appendChild(modalWindowForm);
    const button = modalWindowForm.querySelector('input[type=submit]');
    button.value = 'Выйти';

    modalWindowForm.addEventListener('submit', e => {
        e.preventDefault();
        window.location.href = 'http://localhost:3000/';
    });

    document.body.appendChild(modalWindow);
}

function showInformationModalWindow(text) {
    const modalWindow = createModalWindow();
    const p = document.createElement('p');
    p.innerText = text;
    modalWindow.querySelector('.popup-body').appendChild(p);
    document.body.appendChild(modalWindow);
    setTimeout(() => document.body.removeChild(modalWindow), 5000);
}

function showReadyCheckModalWindow() {
    const modalWindow = createModalWindow();
    const modalWindowBody = modalWindow.querySelector('.popup-body');
    const title = document.createElement('h4');
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

function showChoosePlayerModalWindow(players, title, tag) {
    const modalWindow = createModalWindow();
    const modalWindowForm = createModalWindowForm(title);
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

        socket.emit(tag, JSON.stringify({
            payload: {
                id: formData.get('chosenPlayerId')
            }
        }));
        document.body.removeChild(modalWindow);
    });

    document.body.appendChild(modalWindow);
}

function showVotes(votes) {
    const players = document.querySelectorAll('.player');
    for (let i = 0; i < players.length; i++) {
        const previousVote = players[i].querySelector('.vote');
        if (previousVote !== null) {
            players[i].removeChild(previousVote);
        }

        const vote = document.createElement('img');
        vote.classList.add('vote');
        if (votes[i] === 'ja') {
            vote.src = 'images/votingCards/ja.png';
            vote.alt = 'ja-vote';
        } else {
            vote.src = 'images/votingCards/nein.png';
            vote.alt = 'nein-vote';
        }
        const roleCard = players[i].querySelector('.role-card');
        roleCard.before(vote);
    }
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
    showChoosePlayerModalWindow(payload.players, 'Выберите кандидата в канцлеры', 'chancellorElected');
});

socket.on('electionResults', data => {
    const results = JSON.parse(data).payload.results;
    this.showVotes(results);
    const attention = createModalWindow();
    const title = document.createElement('h3');
    title.innerText = 'Внимание! Результаты голосования.';
    attention.querySelector('.popup-body').append(title);
    document.body.appendChild(attention);
    setTimeout(() => document.body.removeChild(attention), 2000);
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
    const checkboxes = document.body.querySelectorAll('input[type=checkbox]');
    for (let i = 1; i <= payload.skipped; i++) {
        checkboxes[i].checked = true;
    }
});

socket.on('lawAdopted', data => {
    const payload = JSON.parse(data).payload;
    for (let i = 1; i <= payload.fascistField; i++) {
        const field = document.body.querySelector(`#f${i}`);
        removeAllChildren(field);
        field.style.padding = '0';
        const img = document.createElement('img');
        img.src = 'images/lawCards/fascistLaw.png';
        img.alt = 'Фашистский закон';
        img.classList.add('card');
        field.appendChild(img);
    }

    for (let i = 1; i <= payload.liberalField; i++) {
        const field = document.body.querySelector(`#l${i}`);
        removeAllChildren(field);
        const img = document.createElement('img');
        img.src = 'images/lawCards/liberalLaw.png';
        img.alt = 'Либеральный закон';
        img.classList.add('card');
        field.appendChild(img);
    }

    const checkboxes = document.body.querySelectorAll('input[type=checkbox]');
    for (let i = 1; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
});

socket.on('showPlayerPartyAction', data => {
    const players = JSON.parse(data).payload.players;
    showChoosePlayerModalWindow(
        players,
        'Выберите игрока, партию которого вы хотите узнать',
        'showPlayerPartyAction'
    );
})

socket.on('showPlayerParty', data => {
    const payload = JSON.parse(data).payload;
    showInformationModalWindow(
        `Игрок ${payload.nickname} принадлежит партии ${payload.party === 'Liberal' ? 'либералов' : 'фашистов'}`);
});

socket.on('playerPartyKnown', data => {
    const payload = JSON.parse(data).payload;
    showInformationModalWindow(
        `Президент узнал партию игрока ${payload.nickname}`
    );
});

socket.on('killPlayerAction', data => {
   const payload = JSON.parse(data).payload;
   showChoosePlayerModalWindow(
       payload.players,
       'Выберите игрока, которого хотите убить',
       'playerKilled'
       );
});

socket.on('playerKilled', data => {
   const payload = JSON.parse(data).payload;
    showInformationModalWindow(
        `Игрок ${payload.nickname} был убит`
    );
});

socket.on('setNextPresidentAction', data => {
   const payload = JSON.parse(data).payload;
   showChoosePlayerModalWindow(
       payload.players,
       'Выберите игрока, который будет следующим президентом',
       'setNextPresidentAction'
       );
});

socket.on('setNextPresident', data => {
   const payload = JSON.parse(data).payload;
   showInformationModalWindow(`Следующим президентом станет игрок ${payload.nickname}`);
});

socket.on('showDeckAction', data => {
    const payload = JSON.parse(data).payload;
    showTopCardsModalWindow(payload.cards, 'Верхние карты колоды');
});

socket.on('readinessCheck', () => {
    showReadyCheckModalWindow();
});

socket.on('win', data => {
    const payload = JSON.parse(data).payload;
    showWinnerModalWindow(
        `Победила партия ${payload.winner === 'Liberal' ? 'либералов' : 'фашистов'}. \n${payload.reason}`)
});