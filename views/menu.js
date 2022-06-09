const enterBtn = document.querySelector('.enter-button');
const nicknameInput = document.querySelector('.nickname-input');

function getCookie(name) {
    let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

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
    const findBtn = createButton('Найти игру', 'find-button');
    const createBtn = createButton('Новая игра', 'create-button');
    div.appendChild(findBtn);
    div.appendChild(createBtn);
    return div;
}

function getRoomCreationPage() {
    const div = document.createElement('div');
    div.classList.add('container');
    const form = document.createElement('form');
    div.appendChild(form);
    const [inputRoomNameLabel, inputRoomName] = createInputWithLabel('Название комнаты', 'text');
    inputRoomName.classList.add('input-room-name');
    inputRoomName.minLength = 1;
    inputRoomName.maxLength = 16;
    form.appendChild(createContainer(inputRoomName, inputRoomNameLabel));
    const [inputPlayerCountLabel, inputPlayerCount] = createInputWithLabel('', 'range');
    inputPlayerCount.classList.add('input-player-count');
    inputPlayerCount.min = '5';
    inputPlayerCount.max = '10';
    inputPlayerCountLabel.innerText = `Количество игроков: ${inputPlayerCount.value}`;

    inputPlayerCount.addEventListener('change', _ => {
        inputPlayerCountLabel.innerText = `Количество игроков: ${inputPlayerCount.value}`;
    });

    form.appendChild(createContainer(inputPlayerCount, inputPlayerCountLabel));
    const [inputSetPasswordLabel, inputSetPassword] = createInputWithLabel('Вход по паролю', 'checkbox');
    inputSetPassword.classList.add('input-set-password');
    form.appendChild(createContainer(inputSetPassword, inputSetPasswordLabel));
    const [inputPasswordLabel, inputPassword] = createInputWithLabel('Пароль', 'password');
    inputPassword.classList.add('input-password');
    inputPassword.maxLength = 16;
    inputSetPassword.addEventListener('change', _ => {
        if (inputSetPassword.checked) {
            button.before(createContainer(inputPassword, inputPasswordLabel));
        } else {
            form.removeChild(form.children[3]);
        }
    });
    const button = createButton('Создать', 'create-room-button', 'next-button');
    form.appendChild(button);
    return div;
}

function createListItem(name, password, playersCount, maxPlayersCount) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<strong>${name}</strong> ${playersCount}/${maxPlayersCount} ${password ? '<img>' : ''}`; // TODO замочек, если с паролем
    return listItem;
}

async function getListOfRooms() {
    const ul = document.createElement('ul');
    const response = await fetch('http://localhost:3000/api/getAllRooms');
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

            const div = document.createElement('div');
            div.classList.add('password-container');

            if (room.password) {
                const [passwordInputLabel, passwordInput] = createInputWithLabel('Пароль', 'password');
                div.appendChild(passwordInputLabel);
            }

            const button = createButton('Войти', 'enter-room-button');
            div.appendChild(button);
            button.addEventListener('click', async _ => {
                const response = await fetch('http://localhost:3000/enter', {
                    method: 'POST', headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    }, body: JSON.stringify({
                        id: room.id,
                        password: div.querySelector('input')?.value
                    })
                });

                if (response.status === 200) {
                    const html = await response.text();
                    document.write(html);
                } else {
                    // TODO обработать случай неправильного пароля
                }
            })
            listItem.appendChild(div);
        });
        ul.appendChild(listItem);
    }
    return ul;
}

async function getListOfRoomsPage() {
    const div = document.createElement('div');
    div.classList.add('container');
    div.appendChild(await getListOfRooms());
    const updateButton = createButton('Обновить', 'update-button');
    div.appendChild(updateButton);
    updateButton.addEventListener('click', async _ => {
        const list = div.querySelector('ul');
        div.replaceChild(await getListOfRooms(), list);
    })
    return div;
}

const states = {
    loginPage: document.querySelector('.container'),
    menuPage: getMenuPage(),
    roomCreationPage: getRoomCreationPage()
}

enterBtn.addEventListener('click', async _ => {
    const response = await fetch('http://localhost:3000/api/setName', {
        method: 'POST', headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }, body: JSON.stringify({
            nickname: nicknameInput.value
        })
    });
    if (response.status === 200) {
        changeState(states.loginPage, states.menuPage);
    } else {
        // TODO вывод сообщения под полем
    }
})

// TODO добавить кнопку "Назад"

const findBtn = states.menuPage.querySelector('.find-button');
const createBtn = states.menuPage.querySelector('.create-button');

findBtn.addEventListener('click', async _ => {
    const state = await getListOfRoomsPage();
    changeState(states.menuPage, state);
})

createBtn.addEventListener('click', _ => {
    changeState(states.menuPage, states.roomCreationPage);
})

const createRoomBtn = states.roomCreationPage.querySelector('.create-room-button');

createRoomBtn.addEventListener('click', async _ => {
    const roomName = document.querySelector('.input-room-name').value;
    const playersCount = Number(document.querySelector('.input-player-count').value);
    const password = document.querySelector('.input-password')?.value;

    if (roomName.length < 1 || 16 < roomName.length) {
        // TODO вывести сообщение о некорректном имени комнаты
        return;
    }

    if (isNaN(playersCount) || playersCount < 5 || 10 < playersCount) {
        // TODO вывести сообщение о некорректном количестве игроков
        return;
    }

    if (password !== undefined && (password.length < 4 || 16 < password.length)) {
        // TODO вывести сообщение о некорректном пароле
        return;
    }


    let response = await fetch('http://localhost:3000/api/createRoom', {
        method: 'POST', headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }, body: JSON.stringify({
            name: roomName,
            playersCount: playersCount,
            password: password
        })
    });

    if (response.status === 200) {
        const message = await response.json();
        const html = await (await fetch('http://localhost:3000/enter', {
            method: 'POST', headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                id: message.id,
                password: password
            })
        })).text();
        document.write(html);
    } else {
        console.log('все плохо');
        // TODO вывести сообщение, что все плохо
    }
})