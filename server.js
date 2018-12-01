const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI, { useMongoClient: true })

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))

const userSchema = new mongoose.Schema({
  username: String
})
const User = mongoose.model('User', userSchema)

const exerciseSchema = new mongoose.Schema({
  userId: String,
  description: String,
  minutes: Number,
  date: Date
})
const Exercise = mongoose.model('Exercise', exerciseSchema)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    errCode = 400
    const keys = Object.keys(err.errors)
    errMessage = err.errors[keys[0]].message
  } else {
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

app.post('/api/exercise/new-user', (req, res) => {
  let username = req.body.username | 'unnamed_user'
  User.create({username: username}, (err, data) => {
    if(err){
      console.log(err)
    }
    else {
      console.log(`${data.username} created successfully.`)
      res.json({"username": data.username, "_id": data._id})
    }
  })
})

app.get('/api/exercise/users', (req, res) => {
  User.find({}, (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      res.json(data)
    }
  })
})

app.post('/api/exercise/add', (req, res) => {
  let userId = req.body.userId
  User.find({_id: userId}, (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      if(data == null) {
        res.json({"error": "user doesn't exists"})
      }
      else {
        Exercise.create({
          userId: userId,
          description: req.body.description,
          minutes: req.body.minutes,
          date: req.body.date
        }, (err, data) => {
          if(err) {
            console.log(err)
          }
          else {
            res.json(data)
          }
        })
      }
    }
  })
})

app.get('/api/exercise/log', (req, res) => {
  
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
