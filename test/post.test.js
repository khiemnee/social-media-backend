import app from "../src/app.js";
import request from "supertest";
import Post from "../src/models/post.js";
import { setupDataBase, userOne,userIdOne, postIdOne, userTwo, postOne, userIdTwo } from "./fixtures/db.js";

beforeEach(setupDataBase)


test('create post',async ()=>{
    const response = await request(app).post('/posts').send({
        content : 'đây là bài post',
    }).set('authorization',`Bearer ${userOne.tokens[0].token}`).expect(201)
    const post = await Post.findById(response.body._id)

    expect(post).not.toBeNull()
})


test('create post without authenticated',async ()=>{
    const response = await request(app).post('/posts').send({
        content : 'đây là bài post',
    }).expect(401)

    const post = await Post.findById(response.body._id)

    expect(post).toBeNull()
})

test('delete post',async () =>{
    const response = await request(app).delete(`/posts/${postIdOne}/me`).set('authorization',`Bearer ${userOne.tokens[0].token}`).expect(200)

    const post = await Post.findById(postIdOne)

    expect(response.body).toEqual({})
    expect(post).toBeNull()
})

test('delete post wrong owner',async()=>{
    await request(app).delete(`/posts/${postIdOne}/me`).set('authorization',`Bearer ${userTwo.tokens[0].token}`).expect(404)

    const post = await Post.findById(postIdOne)

    expect(post).not.toBeNull()
})

test('delete post without authenticated',async () =>{
     await request(app).delete(`/posts/${postIdOne}/me`).expect(401)
  
})

test('update post me',async ()=>{
   await request(app).patch(`/posts/${postIdOne}/me`).send({
        content : 'đây là nội dung đã sửa'
    }).set('authorization',`Bearer ${userOne.tokens[0].token}`).expect(200)

    const post = await Post.findById(postIdOne)
    expect(post.content).toEqual('đây là nội dung đã sửa')
})

test('update post not owner',async ()=>{
    await request(app).patch(`/posts/${postIdOne}/me`).send({
        content : 'đây là nội dung đã sửa'
    }).set('authorization',`Bearer ${userTwo.tokens[0].token}`).expect(404)

    const post = await Post.findById(postIdOne)
    expect(post.content).toEqual('đây là nội dung')
})

test('like posts',async ()=>{
    await request(app).post(`/posts/${postIdOne}/likes`).set('authorization',`Bearer ${userTwo.tokens[0].token}`).expect(200)

    const post = await Post.findById(postIdOne)
    expect(post.likes.includes(userIdTwo))
})

test('unlike posts',async ()=>{
    await request(app).post(`/posts/${postIdOne}/likes`).set('authorization',`Bearer ${userOne.tokens[0].token}`).expect(200)
    const post = await Post.findById(postIdOne)
    expect(post.likes).toEqual([])
})

test('get posts me',async ()=>{
    const response = await request(app).get('/posts/me').set('authorization',`Bearer ${userOne.tokens[0].token}`).expect(200)

    expect(request.body).not.toBeNull()
})