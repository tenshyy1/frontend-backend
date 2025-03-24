const backendUrl = 'http://localhost:3000';

document.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.querySelector('#username').value;
    const password = form.querySelector('#password').value;
    const endpoint = form.id === 'registerForm' ? '/register' : '/login';
    const message = document.getElementById('message');

    const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    message.textContent = data.message || 'Успех!';

    if (form.id === 'registerForm' && response.ok) {
        alert('Регистрация успешна! Перенаправление на страницу входа.');
        window.location.href = '/login.html';
    } else if (form.id === 'loginForm' && data.token) {
        localStorage.setItem('token', data.token);
        console.log('JWT Token:', data.token); 

        alert('Вход выполнен! Перенаправление на главную.');
        window.location.href = '/index.html';
    }
});

async function getProtectedData() {
    const token = localStorage.getItem('token');
    const result = document.getElementById('result');

    if (!token) {
        result.textContent = 'Сначала войдите в систему!';
        return;
    }

    const response = await fetch(`${backendUrl}/protected`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    result.textContent = data.message || 'Ошибка доступа';
}
