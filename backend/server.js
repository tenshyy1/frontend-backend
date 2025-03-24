require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'secret';

const users = [];

app.use(cors());
app.use(bodyParser.json());

// Регистрация
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: 'Пользователь уже существует' });
    }
    users.push({ username, password });
    res.status(201).json({ message: 'Пользователь зарегистрирован' });
});

// Логин
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Неверные учетные данные' });
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Middleware проверки JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Токен не предоставлен' });

    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Недействительный токен' });
        req.user = user;
        next();
    });
}

// Защищенный маршрут
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Добро пожаловать, ${req.user.username}! ` });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
