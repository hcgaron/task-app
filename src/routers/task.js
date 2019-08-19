const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

// task creation endpoint (C in CRUD) for REST API
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
})


// fetch multiple tasks endpoint (R in CRUD) for REST API
// limit & skip are used to implement pagination of data
router.get('/tasks', auth, async (req, res) => {
  try {
    const match = {}
    const sort = {}

    if (req.query.completed) {
      match.completed = req.query.completed.toLowerCase() === 'true'
    }

    if (req.query.sortBy) {
      //  1 is ascending, -1 is descending
      const parts = req.query.sortBy.split('_');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit), // ignored if limit isn't provided or isn't a number
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate();
    res.send(req.user.tasks)
  } catch (error) {
    res.status(500).send();
  }
})


// fetch individual task by ID endpoint (R in CRUD) for REST API
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // ensure we only get a task with given id if it belongs to the user requesting it
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
})

// update a task by ID (U in CRUD) for REST API
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdated = ['description', 'completed'];
  const isValidUpdate = updates.every((update) => {
    return allowedUpdated.includes(update);
  })

  if (!isValidUpdate) {
    return res.status(400).send({ error: 'Invalid update!' })
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      task[update] = req.body[update];
    })

    await task.save();
    res.send(task);
  } catch (error) {
    return res.status(400).send();
  }

})

// delete a task (D in CRUD) for REST API
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    // object we pass in sets parameters for the task for which we are searching
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      res.send(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
})




module.exports = router;