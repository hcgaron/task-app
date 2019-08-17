const express = require('express');
const User = require('../models/user');
const router = new express.Router();

// user creation endpoint (C in CRUD) for REST API
router.post('/users', async (req, res) => {
    const user = new User(req.body);
  
    try {
      await user.save()
      res.status(201).send(user);
    } catch (e) {
      res.status(400).send(e);
    }
  })
  
  // fetch multiple users endpoint (R in CRUD) for REST API
  router.get('/users', async (req, res) => {
    try {
      const users = await User.find({});
      res.send(users);
    } catch (error) {
      res.status(500).send();
    }
  })
  
  // fetch individual user by ID endpoint (R in CRUD) for REST API
  router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
  
    try {
      const user = await User.findById(_id);
      if (!user) {
        return res.status(404).send();
      }
  
      res.send(user);
    } catch (error) {
      res.status(500).send();
    }
  })
  
  // update a user (U in CRUD) for REST API
  router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update);
    })
  
    if (!isValidOperation) {
      return res.status(400).send({error: 'Invalid updates!'})
    }
  
    try {
      const user = await User.findByIdAndUpdate(req.params.id,  req.body , { 
        new: true ,
        runValidators: true
      });
      if (!user) {
        return res.status(404).send();
      }
  
      res.send(user);
    } catch (error) {
      res.status(400).send(error);
    }
  })
  
  // delete a user (D in CRUD) for REST API
  router.delete('/users/:id', async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
  
      if (!user) {
        return res.status(404).send();
      }
  
      res.send(user);
    } catch (error) {
      res.status(500).send();
    }
  })

module.exports = router;