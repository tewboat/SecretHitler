const nicknameInput = document.querySelector('.nickname-input');

let name = getCookie('nickname');
if (name !== undefined) {
    nicknameInput.value = name;
}

function changeState(currentState, nextState) {
    document.body.removeChild(currentState);
    document.body.appendChild(nextState);
}

function createInputWithLabel(labelText, inputType) {
    const label = document.createElement('label');
    label.innerHTML = labelText;
    const input = document.createElement('input');
    input.type = inputType;
    return [label, input];
}

function createContainer(input, label) {
    const div = document.createElement('div');
    div.classList.add('input-container');
    div.appendChild(input);
    div.appendChild(label);
    return div;
}

function createButton(text, ...classes) {
    const button = document.createElement('input');
    button.type = 'button';
    button.value = text;
    button.classList.add(...classes);
    return button;
}

function getMenuPage() {
    const div = document.createElement('div');
    div.classList.add('container');
    const backButton = createButton('<', 'back-button');
    const findBtn = createButton('Найти игру', 'find-button');
    const createBtn = createButton('Новая игра', 'create-button');
    backButton.addEventListener('click', async _ => {
        changeState(document.querySelector('.container'), states.loginPage);
    });
    div.appendChild(backButton);
    div.appendChild(findBtn);
    div.appendChild(createBtn);
    return div;
}

function getRoomCreationPage() {
    const div = document.createElement('div');
    div.classList.add('container');
    const backButton = createButton('<', 'back-button');
    div.appendChild(backButton);
    backButton.addEventListener('click', async _ => {
        changeState(document.querySelector('.container'), states.menuPage);
    });
    const form = document.createElement('form');
    form.classList.add('room-creation-form');
    div.appendChild(form);
    const [inputRoomNameLabel, inputRoomName] = createInputWithLabel('Название комнаты', 'text');
    inputRoomName.name = 'roomName';
    inputRoomName.required = true;
    inputRoomName.minLength = 1;
    inputRoomName.maxLength = 16;
    form.appendChild(createContainer(inputRoomName, inputRoomNameLabel));
    const [inputPlayerCountLabel, inputPlayerCount] = createInputWithLabel('', 'range');
    inputPlayerCount.name = 'playerCount';
    inputPlayerCount.required = true;
    inputPlayerCount.min = '5';
    inputPlayerCount.max = '10';
    inputPlayerCountLabel.innerText = `Количество игроков: ${inputPlayerCount.value}`;

    inputPlayerCount.addEventListener('change', _ => {
        inputPlayerCountLabel.innerText = `Количество игроков: ${inputPlayerCount.value}`;
    });

    form.appendChild(createContainer(inputPlayerCount, inputPlayerCountLabel));
    const [inputSetPasswordLabel, inputSetPassword] = createInputWithLabel('Вход по паролю', 'checkbox');
    form.appendChild(createContainer(inputSetPassword, inputSetPasswordLabel));
    const [inputPasswordLabel, inputPassword] = createInputWithLabel('Пароль', 'password');
    inputPassword.name = 'password';
    inputPassword.required = true;
    inputPassword.minLength = 4;
    inputPassword.maxLength = 16;
    inputSetPassword.addEventListener('change', _ => {
        if (inputSetPassword.checked) {
            submit.before(createContainer(inputPassword, inputPasswordLabel));
        } else {
            form.removeChild(form.children[3]);
        }
    });
    const submit = document.createElement('input');
    submit.type = 'submit';
    submit.classList.add('create-room-button', 'next-button');
    submit.value = 'Создать';
    form.appendChild(submit);
    return div;
}

function createListItem(name, password, playersCount, maxPlayersCount) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<h3>${name}</h3>`;
    listItem.innerHTML += `В игре: ${playersCount}  Максимум: ${maxPlayersCount} ${password ? '🔓' : ''}`;
    return listItem;
}

async function getListOfRooms() {
    const ul = document.createElement('ul');
    const response = await fetch('/api/getAllRooms');
    const rooms = await response.json();

    let lastClicked = null;

    for (let room of rooms) {
        const listItem = createListItem(room.name, room.password, room.playersCount, room.maxPlayersCount);
        listItem.addEventListener('click', _ => {
            if (lastClicked === listItem) {
                return;
            }

            if (lastClicked !== null) {
                const toRemove = lastClicked.querySelector('.password-container');
                lastClicked.removeChild(toRemove);
            }

            lastClicked = listItem;

            const form = document.createElement('form');
            form.classList.add('password-container');

            if (room.password) {
                const [_, passwordInput] = createInputWithLabel('Пароль', 'password');
                passwordInput.name = 'password';
                passwordInput.required = true;
                passwordInput.placeholder = 'Пароль';
                form.appendChild(passwordInput);
            }

            const submit = document.createElement('input');
            submit.type = 'submit';
            submit.classList.add('enter-room-button');
            submit.value = "Войти";

            form.appendChild(submit);
            form.addEventListener('submit', async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                const response = await fetch('/enter', {
                    method: 'POST', headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    }, body: JSON.stringify({
                        id: room.id,
                        password: formData.get('password')
                    })
                });

                if (response.status === 200) {
                    const html = await response.text();

                    if (history.pushState) {
                        window.history.pushState(null, null, `?id=${room.id}`);
                    } else {
                        window.history.replaceState(null, null, `?id=${room.id}`);
                    }

                    document.write(html);
                } else {
                    // TODO обработать случай неправильного пароля
                }
            })
            listItem.appendChild(form);
        });
        ul.appendChild(listItem);
    }
    return ul;
}

async function getListOfRoomsPage() {
    const div = document.createElement('div');
    div.classList.add('container');
    const backButton = createButton('<', 'back-button');
    div.appendChild(backButton);
    div.appendChild(await getListOfRooms());
    const updateButton = createButton('Обновить', 'update-button');
    div.appendChild(updateButton);
    updateButton.addEventListener('click', async _ => {
        const list = div.querySelector('ul');
        div.replaceChild(await getListOfRooms(), list);
    });
    backButton.addEventListener('click', async _ => {
        changeState(document.querySelector('.container'), states.menuPage);
    });
    return div;
}

const states = {
    loginPage: document.querySelector('.container'),
    menuPage: getMenuPage(),
    roomCreationPage: getRoomCreationPage()
}

document.querySelector('.login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch('/api/setName', {
        method: 'POST', headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }, body: JSON.stringify({
            nickname: formData.get('nickname')
        })
    });
    if (response.status === 200) {
        changeState(states.loginPage, states.menuPage);
    }
})

const findBtn = states.menuPage.querySelector('.find-button');
const createBtn = states.menuPage.querySelector('.create-button');

findBtn.addEventListener('click', async _ => {
    const state = await getListOfRoomsPage();
    changeState(states.menuPage, state);
})

createBtn.addEventListener('click', _ => {
    changeState(states.menuPage, states.roomCreationPage);
})

states.roomCreationPage.querySelector('.room-creation-form').addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let response = await fetch('/api/createRoom', {
        method: 'POST', headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }, body: JSON.stringify({
            name: formData.get('roomName'),
            playersCount: formData.get('playerCount'),
            password: formData.get('password')
        })
    });

    if (response.status === 200) {
        const message = await response.json();
        const html = await (await fetch('/enter', {
            method: 'POST', headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                id: message.id,
                password: formData.get('password')
            })
        })).text();

        if (history.pushState) {
            window.history.pushState(null, null, `?id=${message.id}`);
        } else {
            window.history.replaceState(null, null, `?id=${message.id}`);
        }

        document.write(html);
    }
})



