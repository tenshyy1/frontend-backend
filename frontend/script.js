document.addEventListener('DOMContentLoaded', () => {
    const toggleTheme = () => {
        document.body.classList.toggle('dark');
        document.body.classList.toggle('light');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    };

    const theme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(theme);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const response = await fetch('/login', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(formData)),
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                window.location = '/profile.html';
            } else {
                alert('Ошибка входа');
            }
        });

        showRegister.addEventListener('click', () => {
            document.getElementById('auth').style.display = 'none';
            document.getElementById('register').style.display = 'block';
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const response = await fetch('/register', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(formData)),
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                alert('Регистрация успешна');
                document.getElementById('auth').style.display = 'block';
                document.getElementById('register').style.display = 'none';
            } else {
                alert('Ошибка регистрации');
            }
        });
    }

    if (document.getElementById('username')) {
        fetch('/profile')
            .then(res => {
                if (!res.ok) throw new Error('Не авторизован');
                return res.json();
            })
            .then(data => {
                document.getElementById('username').textContent = data.username;
                loadData();
            })
            .catch(() => window.location = '/');

        document.getElementById('refresh').addEventListener('click', loadData);
        document.getElementById('logout').addEventListener('click', () => {
            fetch('/logout', { method: 'POST' })
                .then(() => window.location = '/');
        });
    }
});


async function loadData() {
    const response = await fetch('/data');
    const result = await response.json();
    document.getElementById('data').textContent = result.data;
}