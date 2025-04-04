const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sesion prikols
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hour
    }
}));

const users = new Map();

const authMiddleware = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).redirect('/');
    }
    next();
};

// register
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (users.has(username)) {
        return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.set(username, { password: hashedPassword });
    res.status(201).json({ message: 'Регистрация успешна' });
});

// login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.get(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Неверные данные' });
    }

    req.session.userId = username;
    res.json({ message: 'Вход успешен' });
});

// profile
app.get('/profile', authMiddleware, (req, res) => {
    res.json({ username: req.session.userId });
});

// logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const cacheFile = path.join(__dirname, 'cache.json');
app.get('/data', async (req, res) => {
    try {
        let cacheData = null;
        try {
            const cache = await fs.readFile(cacheFile, 'utf-8');
            cacheData = JSON.parse(cache);
            if (Date.now() - cacheData.timestamp < 60 * 1000) {
                return res.json({ data: cacheData.data, cached: true });
            }
        } catch (e) {
        }

        const newData = {
            timestamp: Date.now(),
            data: `data: ${Math.random()}`
        };
        
        await fs.writeFile(cacheFile, JSON.stringify(newData));
        res.json({ data: newData.data, cached: false });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(3000, () => {
    console.log('Сервер запущен: \x1b[34mhttp://localhost:3000\x1b[0m');
  });
  