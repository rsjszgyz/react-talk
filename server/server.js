import express from 'express'

import csshook from 'css-modules-require-hook/preset'
import assethook from 'asset-require-hook'

import React from 'react'
import { renderToNodeStream } from 'react-dom/server'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import App from '../src/App'
import reducers from '../src/reducer'

import staticPath from '../build/asset-manifest.json'

assethook({
  extensions: ['png'],
  limit: 10000
})

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const model = require('./model')
const Chat = model.getModel('chat')

const path = require('path')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
io.on('connection', function(socket) {
  socket.on('sendmsg', function(data) {
    const { from, to, msg } = data
    const chatid = [from, to].sort().join('_')
    Chat.create({ chatid, from, to, content: msg }, function(err, doc) {
      io.emit('recvmsg', Object.assign({}, doc._doc))
    })
  })
})

const userRouter = require('./user')

app.use(cookieParser())
app.use(bodyParser.json())
app.use('/user', userRouter)

app.use(function(req, res, next) {
  if (req.url.startsWith('/user') || req.url.startsWith('/static')) {
    return next()
  }
  const store = createStore(reducers, compose(applyMiddleware(thunk)))
  const context = {}

  // const markup = renderToString(
  //   <Provider store={store}>
  //     <StaticRouter location={req.url} context={context}>
  //       <App />
  //     </StaticRouter>
  //   </Provider>
  // )

  const obj = {
    '/msg': '聊天',
    '/boss': 'Boss'
  }

  res.write(`<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <meta name="theme-color" content="#000000" />
      <title>React App</title>
      <link rel="stylesheet" href="${staticPath['main.css']}">
      <meta name="keywords" content="React, Redux" />
      <meta name="description" content="${obj[req.url]}" />
    </head>
    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root">`)

  const markupStream = renderToNodeStream(
    <Provider store={store}>
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>
    </Provider>
  )

  markupStream.pipe(
    res,
    { end: false }
  )

  markupStream.on('end', () => {
    res.write(`</div>
    <script src="${staticPath['runtime~main.js']}"></script>
    <script src="${staticPath['main.js']}"></script>
  </body>
</html>`)
    res.end()
  })

  //   const pageHtml = `<!DOCTYPE html>
  // <html lang="en">
  //   <head>
  //     <meta charset="utf-8" />
  //     <meta
  //       name="viewport"
  //       content="width=device-width, initial-scale=1, shrink-to-fit=no"
  //     />
  //     <meta name="theme-color" content="#000000" />
  //     <title>React App</title>
  //     <link rel="stylesheet" href="/${staticPath['main.css']}">
  //     <meta name="keywords" content="React, Redux" />
  //     <meta name="description" content="${obj[req.url]}" />
  //   </head>
  //   <body>
  //     <noscript>You need to enable JavaScript to run this app.</noscript>
  //     <div id="root">${markup}</div>
  //     <script src="/${staticPath['main.js']}"></script>
  //   </body>
  // </html>
  // `

  // res.send(pageHtml)
  // return res.sendFile(path.resolve('build/index.html'))
})
app.use('/', express.static(path.resolve('build')))

server.listen(9093, function() {
  console.log('Node app start at port 9093')
})
