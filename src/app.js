const express = require('express'); 
const cors = require('cors'); 
const { errorHandler } = require('./middleware/errorHandler');
const { limiter } = require('./middleware/rateLimiter');
const projectionsRouter = require('./routes/projections');

const app = express();
const allowedOrigins = ['http://localhost:3000'];
app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true); 
        if(allowedOrigins.includes(origin)){
            callback(null, true); 
        }else{
            callback(new Error(`Cors policy: origin '${origin}' is not allowed`)); 
        }
    }
    //placeholder for sending cookies or auth headers in the future
}));
app.use(express.json());
app.use(limiter);
app.use(express.static('public'));

app.use('/api/projections', projectionsRouter);
app.use(errorHandler);

module.exports = app;
