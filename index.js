import express from 'express';
import cors from 'cors';
import dotEnv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

dotEnv.config();
app.use(cors());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

import { uid } from 'uid';

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];
let exercises = [];
// ! Create a New User
app.post('/api/users', (req, res) => {
  let theUsername = req.body.username;
  if (theUsername === '') {
    return res.json({ error: 'Username is required' })
  } else {
    let newUser = { username: theUsername, _id: uid(2) };
    users.push(newUser);
    res.json(newUser);
  }
})

// ! Add Exercise to User
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find((user) => user._id === _id);
  if (description === '') {
    return res.json({ error: 'Description is required' })
  }
  if (duration === '') {
    return res.json({ error: 'Duration is required' })
  }
  if (date === '') {
    return res.json({ error: 'Date is required' })
  }
  const newExercise = {
    username: user.username,
    description: description,
    duration: duration,
    date: new Date(date).toDateString(),
    _id: user._id
  }
  exercises.push(newExercise);
  res.json(newExercise);
})

// ! Get User's Exercise Log 
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find((user) => user._id === req.params._id);
  const { from, to, limit } = req.query;
  let theLog = exercises.filter((exercise) => exercise._id === user._id);

  theLog = theLog.map((exercise) => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date
    }
  })
  if (from) {
    theLog = theLog.filter((exercise) => new Date(exercise.date).getTime() >= new Date(from).getTime());
  }
  if (to) {
    theLog = theLog.filter((exercise) => new Date(exercise.date).getTime() <= new Date(to).getTime());
  }
  if (limit) {
    theLog = theLog.slice(0, limit);
  }
  res.json({
    username: user.username,
    count: theLog.length,
    _id: user._id,
    log: theLog
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
