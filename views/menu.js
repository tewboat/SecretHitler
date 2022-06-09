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

// function createInputWithLabel(labelText, inputType) {
//     const label = document.createElement('label');
//     const p = document.createElement('p');
//     p.innerText = labelText;
//     label.appendChild(p);
//     const input = document.createElement('input');
//     input.type = inputType;
//     label.appendChild(input);
//     return [label, input];
// }

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

// function getContainer(containers) {
//     let div = document.createElement('div');
//     div.classList.add('container');
//     let form = document.createElement('form');
//     div.appendChild(form);
//     for (const container of containers) {
//         form.appendChild(container);
//     }
//     return div;
// }

function getRoomCreationPage() {
    const div = document.createElement('div');
    div.classList.add('container');
    const form = document.createElement('form');
    div.appendChild(form);
    const [inputRoomNameLabel, inputRoomName] = createInputWithLabel('Название комнаты', 'text');
    inputRoomName.classList.add('input-room-name');
    inputRoomName.minLength = 1;
    inputRoomName.maxLength = 15;
    form.appendChild(createContainer(inputRoomName, inputRoomNameLabel));
    const [inputPlayerCountLabel, inputPlayerCount] = createInputWithLabel('Количество игроков (5 - 10)', 'number');
    inputPlayerCount.classList.add('input-player-count');
    // inputPlayerCount.value = '5';
    inputPlayerCount.min = '5';
    inputPlayerCount.max = '10';
    // inputPlayerCount.addEventListener('input', _ => {
    //     const value = Number(inputPlayerCount.value)
    //     if (value < 0) {
    //         inputPlayerCount.value = String(0);
    //     } else if (value > 10) {
    //         inputPlayerCount.value = String(10);
    //     } // TODO продумать ограничение
    // });
    form.appendChild(createContainer(inputPlayerCount, inputPlayerCountLabel));
    const [inputSetPasswordLabel, inputSetPassword] = createInputWithLabel('Вход по паролю', 'checkbox');
    inputSetPassword.classList.add('input-set-password');
    form.appendChild(createContainer(inputSetPassword, inputSetPasswordLabel));
    const [inputPasswordLabel, inputPassword] = createInputWithLabel('Пароль', 'password');
    inputPassword.classList.add('input-password');
    inputPassword.minLength = 4; // возможно ввести пароль из менее чем 4 символов:(
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


// function getRoomCreationPage() {
//     const div = document.createElement('div');
//     div.classList.add('container');
//     const [inputRoomNameLabel, inputRoomName] = createInputWithLabel('Название комнаты', 'text');
//     inputRoomName.classList.add('input-room-name');
//     inputRoomName.minLength = 1;
//     inputRoomName.maxLength = 15;
//     div.appendChild(inputRoomNameLabel);
//     const [inputPlayerCountLabel, inputPlayerCount] = createInputWithLabel('Количество игроков (5 - 10)', 'number');
//     inputPlayerCount.classList.add('input-player-count');
//     inputPlayerCount.addEventListener('input', _ => {
//         const value = Number(inputPlayerCount.value)
//         if (value < 0) {
//             inputPlayerCount.value = String(0);
//         } else if (value > 10) {
//             inputPlayerCount.value = String(10);
//         } // TODO продумать ограничение
//     });
//     div.appendChild(inputPlayerCountLabel);
//     const [inputSetPasswordLabel, inputSetPassword] = createInputWithLabel('Вход по паролю', 'checkbox');
//     inputSetPassword.classList.add('input-set-password');
//     div.appendChild(inputSetPasswordLabel);
//     const [inputPasswordLabel, inputPassword] = createInputWithLabel('Пароль', 'password');
//     inputPassword.classList.add('input-password');
//     inputPassword.minLength = 4;
//     inputPassword.maxLength = 16;
//     inputSetPassword.addEventListener('change', _ => {
//         if (inputSetPassword.checked) {
//             inputSetPasswordLabel.after(inputPasswordLabel);
//         } else {
//             div.removeChild(inputPasswordLabel);
//         }
//     });
//     const button = createButton('Создать', 'create-room-button', 'next-button');
//     div.appendChild(button);
//     return div;
// }

const states = {
    loginPage: document.querySelector('.container'),
    menuPage: getMenuPage(),
    roomCreationPage: getRoomCreationPage()
}

enterBtn.addEventListener('click', async _ => {
    let response = await fetch('http://localhost:3000/api/setName', {
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

const findBtn = states.menuPage.querySelector('.find-button');
const createBtn = states.menuPage.querySelector('.create-button');

findBtn.addEventListener('click', _ => {
    // TODO запрос всех комнат и переход к соответствующей странице
})

createBtn.addEventListener('click', _ => {
    changeState(states.menuPage, states.roomCreationPage);
})

const createRoomBtn = states.roomCreationPage.querySelector('.create-room-button');

createRoomBtn.addEventListener('click', async _ => {
    const roomName = states.roomCreationPage.querySelector('.input-room-name').value;
    const playersCount = states.roomCreationPage.querySelector('.input-player-count').value;
    const password = states.roomCreationPage.querySelector('.input-password')?.value;

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
        const message = await response.json()
        window.location.replace(`http://localhost:3000/enter?id=${message.id}`)
    } else {
        // TODO вывести сообщение, что все хуево
    }
})