const enterButton = document.querySelector('.enter-button');
const nicknameInput = document.querySelector('.nickname-input');

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

nicknameInput.value = getCookie('nickname');

let currentStateIndex = 0;

function changeState(currentState, nextState) {
    document.body.removeChild(currentState);
    document.body.appendChild(nextState);
}

function getMenuPage() {
    const div = document.createElement('div');
    div.classList.add('container');
    const findButton = document.createElement('input');
    findButton.type = 'button';
    findButton.value = 'Найти игру';
    findButton.classList.add('find-button');
    const createButton = document.createElement('input');
    createButton.type = 'button';
    createButton.value = 'Новая игра';
    createButton.classList.add('create-button');
    div.appendChild(findButton);
    div.appendChild(createButton);
    return div;
}

const states = [document.querySelector('.container'), getMenuPage()]

enterButton.addEventListener('click', async _ => {
    let response = await fetch('http://localhost:3000/api/setName', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            type: 'info',
            payload: {
                nickname: nicknameInput.value
            }
        })
    });
    if (response.status === 200) {
        changeState(states[currentStateIndex], states[1]);
    } else {
        // TODO вывод сообщения под полем
    }
})

const findButton = states[1].querySelector('.find-button');
const createButton = states[1].querySelector('.create-button');

findButton.addEventListener('click', _ => {
    // TODO запрос всех комнат и переход к соответсвующей странице
})

createButton.addEventListener('click', _ => {
    // TODO переход на страницу создания комнаты
})


