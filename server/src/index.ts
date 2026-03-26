import express from 'express';
import path from 'path';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server'

import App from './react/app.js';

const app = express();
const port = process.env.PORT || 3000;

app.use((req, _, next) => {
    console.log(`${req.ip} ${req.method} ${req.path}`)
    next();
})

app.use(express.static(path.join(import.meta.dirname, 'public')));

app.get('/', (_, res) => {
    const { pipe } = renderToPipeableStream(React.createElement(App), {
        bootstrapModules: ['main.js'],
        onShellReady() {
            res.setHeader('content-type', 'text/html');
            pipe(res);
        }
    })
})

app.get('/health', (_, res) => {
    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

