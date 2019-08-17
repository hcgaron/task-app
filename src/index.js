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








//  *************************** //
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const myFunction = async () => {
//   // create a new JSON web token; returns token
//   // 2nd argument is a secret to make sure token hasn't been faked or tampered
//   const token = jwt.sign({ _id: 'abc123'  }, 'thisismynewcourse', { expiresIn: '7 days'});
//   console.log(token);

//   // verify token
//   const data = jwt.verify(token, 'thisismynewcourse');
//   console.log(data);
// }

// myFunction();