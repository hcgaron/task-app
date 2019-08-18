const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express();
const port = process.env.PORT || 3000;

// this is a middleware function that will be run prior to the route handler taking over
// app.use((req, res, next) => {
//   if (req.method === 'GET') {
//     res.status(400).send('Get requests are disabled');
//   } else {
//     next();
//   }
// });

// app.use((req, res, next) => {
//   const maintenenceMode = true;
//   if (maintenenceMode) {
//     res.status(503).send('Site currently disabled for maintenance.  Please try again soon.')
//   } else {
//     next();
//   }
// })

app.use(express.json()); // automatically parse incoming JSON into an object
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log('Server is up on ' + port);
});
