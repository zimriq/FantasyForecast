const express = require('express'); 
const cors = require('cors'); 
const { errorHandler } = require('./middleware/errorHandler');
const { limiter } = require('./middleware/rateLimiter');
const projectionsRouter = require('./routes/projections');

const app = express();

app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(express.static('public'));

app.use('/api/projections', projectionsRouter);
app.use(errorHandler);

module.exports = app;
