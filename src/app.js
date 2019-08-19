const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express();

app.use(express.json()); // automatically parse incoming JSON into an object
app.use(userRouter);
app.use(taskRouter);

module.exports = app;