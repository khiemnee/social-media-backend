import express from 'express'
import('../src/database/db.js')
import userRouter from './router/user.js'
import postRouter from './router/post.js'
import commentRouter from './router/comment.js'

const app = new express()


app.use(express.json())
app.use(userRouter)
app.use(postRouter)
app.use(commentRouter)

export default app