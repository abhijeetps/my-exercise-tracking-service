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
  duration: Number,
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
  let username = req.body.username
  if(!username) {
    username = 'unnamed_user'
  }
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
      res.json({"error": "User does not exist."})
    }
    else {
      if(data == null) {
        res.json({"error": "User does not exist."})
      }
      else {
        let description = req.body.description
        let duration = req.body.duration
        let date = req.body.date
        if(!description) {
          description = 'It has some description'
        }
        if(!duration) {
          duration = 60
        }
        if(!date) {
          date = Date.now()
        }
        Exercise.create({
          userId: userId,
          description: description,
          duration: duration,
          date: date
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

app.get('/api/exercise/log/:userId/:from?/:to?/:limit?', (req, res) => {
  console.log(req.params)
  let userId = req.params.userId
  let from = req.params.from
  let to = req.params.to
  let limit = req.params.limit
  if(!userId) {
    res.json({"Error" : "UserId not defined."})
  }
  if(!from) {
    from = Date.now()
  }
  if(!to) {
    to = Date.now()
  }
  if(!limit) {
    limit = 0
  }
  User.findOne({username: userId}, (err, user) => {
    if(err) {
      console.log('Error fetching data')
    }
    else if (!user) {
      res.json({"user": "UserId not found."})
    }
    else {
      
    }
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
