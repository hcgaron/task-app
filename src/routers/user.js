const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account');
const router = new express.Router();

// user creation endpoint (C in CRUD) for REST API ("sign-up")
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name);
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

// user log-out route (will delete authToken)
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

// user log-out of ALL sessions (delete ALL authTokens)
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
})


// fetch user profile endpoint (R in CRUD) for REST API
// 2nd argument is the middleware function to run before route handler
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})


// update a user (U in CRUD) for REST API
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update];
        })

        await req.user.save();

        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
})

// delete a user (D in CRUD) for REST API
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (error) {
        res.status(500).send();
    }
})


// allow users to upload Profile Picture
const upload = multer({  // set up multer
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) { // verify filetype w/ regex
            return cb(new Error('Please upload an image file'))
        }

        cb(undefined, true) // silently accept file
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // multer passes file data to route handler when no 'dest' property set up on multer
    // call sharp w/ file data and manipulate
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save(); // save profile photo to user
    res.send();
}, (error, req, res, next) => { // callback that handles uncaught errors
    res.status(400).send({ error: error.message })
})

// DELETE user AVATAR
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send();
    } catch (error) {
        res.status(500).send();
    }
})

// FETCH user AVATAR
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();
    }
})

module.exports = router;