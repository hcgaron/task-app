const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { 
    userOneId, 
    userOne, 
    setupDatabase, 
    userTwo, 
    userTwoId,
    taskOne,
    taskTwo,
    taskThree } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Chase bubbles'
        })
        .expect(201)

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
})

test('Should fetch tasks for an authenticated user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(1);
})

test('Should fail to delete a different users task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskTwo._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskTwo._id)
    expect(task).not.toBeNull()
})