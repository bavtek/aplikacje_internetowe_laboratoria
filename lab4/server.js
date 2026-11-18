const express = require('express');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Witaj w aplikacji Express!');
});

app.get('/contact', (req, res) => {
    res.send('Strona kontaktowa');
});

app.get('/api/info', (req, res) => {
    res.json({
        application: 'Express LAB4',
        version: '1.0'
    });
});

app.get('/api/users/search', (req, res) => {
    const { name, page = 1 } = req.query;

    res.json({ name, page });
});

app.get('/api/users/:id', (req, res) => {
    const id = req.params.id;

    res.json({
        message: 'Pobrano użytkownika',
        id: id
    });
});

app.post('/api/users', (req, res) => {
    const name = req.body?.name;

    if (!name) {
        return res.status(400).json({ error: 'Pole name jest wymagane' });
    }

    res.status(201).json({ id: 3, name });
});

app.put('/api/users/:id', (req, res) => {
    if (Number(req.params.id) !== 1) {
        return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    }

    res.status(200).json({ id: 1, name: req.body?.name });
});

app.delete('/api/users/:id', (req, res) => {
    if (Number(req.params.id) !== 1) {
        return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    }

    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
});