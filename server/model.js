const mongoose = require('mongoose')

const env = process.env.NODE_ENV || 'development'

const DB_URL =
  env === 'development'
    ? 'mongodb://localhost:27017/react-talk'
    : 'mongodb://127.0.0.1:27017/react-talk'

mongoose.connect(DB_URL, { useNewUrlParser: true })

const models = {
  user: {
    user: { type: String, require: true },
    pwd: { type: String, require: true },
    type: { type: String, require: true },
    avatar: { type: String },
    desc: { type: String },
    title: { type: String },
    company: { type: String },
    money: { type: String }
  },
  chat: {
    chatid: { type: String, require: true },
    from: { type: String, require: true },
    to: { type: String, require: true },
    read: { type: Boolean, default: false },
    content: { type: String, require: true, default: '' },
    create_time: { type: String, default: Date.now }
  }
}

for (let m in models) {
  mongoose.model(m, new mongoose.Schema(models[m]))
}

module.exports = {
  getModel: function(name) {
    return mongoose.model(name)
  }
}
