const express = require('express');
const Task = require('../models/task');
const router = new express.Router();

// task creation endpoint (C in CRUD) for REST API
router.post('/tasks', async (req, res) => {
    const task = new Task(req.body);
    try {
      await task.save();
      res.status(201).send(task);
    } catch (error) {
      res.status(400).send(error);
    }
  })
  
  
  // fetch multiple tasks endpoint (R in CRUD) for REST API
  router.get('/tasks', async (req, res) => {
    try {
      const tasks = await Task.find({});
      res.send(tasks)
    } catch (error) {
      res.status(500).send();
    }
  })
  
  
  // fetch individual task by ID endpoint (R in CRUD) for REST API
  router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id;
    try {
      const task = await Task.findById(_id);
      if (!task) {
        return res.status(401).send();
      }
  
      res.send(task);
    } catch (error) {
      res.status(500).send(error);
    }
  })
  
  // update a task by ID (U in CRUD) for REST API
  router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdated = ['description', 'completed'];
    const isValidUpdate = updates.every((update) => {
      return allowedUpdated.includes(update);
    })
  
    if (!isValidUpdate) {
      return res.status(400).send({error: 'Invalid update!'})
    }
  
    try {
        const task = await Task.findById(req.params.id);
        updates.forEach((update) => {
            task[update] = req.body[update];
        })
        await task.save();
  
        if (!task) {
          return res.status(404).send();
        }
  
        res.send(task);
    } catch (error) {
      return res.status(400).send();
    }
  
  })
  
  // delete a task (D in CRUD) for REST API
  router.delete('/tasks/:id', async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
  
      if (!task) {
        res.send(404).send();
      }
  
      res.send(task);
    } catch (error) {
      res.status(500).send();
    }
  })

  module.exports = router;