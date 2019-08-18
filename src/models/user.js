const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

// create a schema for our user model so we can use middleware
// middleware will allow us to access hooks to do things like hash passwords
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password must not contain "password"');
      }
    }
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number')
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
})

// setus up a virtual field which allows two separate collections to find a common
// relationship.  In this case, it will allow users to find all the taks that they
// own.  This is possible because the userId is stored under the 'owner' property
// of each task in the tasks collection.
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id', // what property from THIS object should we try to match on the OTHER object 
  foreignField: 'owner' // what property on the OTHER object can potentially match the local property above
})

// hide sensitive data from getting sent back to the user (passwords & tokens array)
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
}

// generates authentication token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse');
  // save token to the user info in the database
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
}

// returns a user attached to the request if the user is authenticated
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
}

// has the plain-text password before saving
userSchema.pre('save', async function (next) {
  const user = this;  // makes the code below clearer / more readable

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next() // must be called at the end so we continue our program
})

// Delete user tasks when user is removed (middleware)
userSchema.pre('remove', async function(next) {
  const user = this;
  await Task.deleteMany({ owner: user._id })

  next();
})

const User = mongoose.model('User', userSchema)

module.exports = User;