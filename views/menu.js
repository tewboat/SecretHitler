const enterButton = document.querySelector('.enter-button');
const nicknameInput = document.querySelector('.nickname-input');

enterButton.addEventListener('click', async _ => {
    let response = await fetch('http://localhost:3000/setName', {
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
        console.log('next step'); // TODO переход к экрану с кнопками
    } else {
        // TODO вывод сообщения под полем
    }
})
