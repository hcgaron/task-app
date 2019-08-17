const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();

// user creation endpoint (C in CRUD) for REST API ("sign-up")
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save()
        const token = await user.generateAuthToken(); // get JSON web token
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
})

// user sign-in 
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken(); // get JSON web token 


        res.send({ user, token });
    } catch (error) {
        res.status(400).send();
    }
})

// fetch multiple users endpoint (R in CRUD) for REST API
// 2nd argument is the middleware function to run before route handler
router.get('/users', auth, async (req, res) => {
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
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(req.params.id);
        updates.forEach((update) => {
            user[update] = req.body[update];
        })

        await user.save();
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