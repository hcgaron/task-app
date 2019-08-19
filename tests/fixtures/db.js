const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Moose',
    email: 'moose@example.com',
    password: 'moose1what?!',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Delilah',
    email: 'delilah@example.com',
    password: 'dede1what?!',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Chase deer',
    completed: false,
    owner: userTwoId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Chase bubbles',
    completed: true,
    owner: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'beg for food',
    completed: true,
    owner: userTwoId
}

const setupDatabase = async () => {
    // wipe our user database before each test for clean environment
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save() // create a user for use in later tests
    await new User(userTwo).save() // create a user for use in later tests
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    setupDatabase,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree
}