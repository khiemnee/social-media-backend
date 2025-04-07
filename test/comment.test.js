import app from "../src/app.js";
import request from "supertest";
import Comment from "../src/models/comment.js";
import { setupDataBase, userOne,userIdOne, postIdOne, userTwo,  commentIdOne } from "./fixtures/db.js";

beforeEach(setupDataBase)

test('comment post',async()=>{
   const response = await request(app).post(`/posts/${postIdOne}/comments`).send({
        text : 'xin chào mọi người'
    }).set('authorization',`Bearer ${userTwo.tokens[0].token}`).expect(201)

    expect(response.body[1].text).toEqual('xin chào mọi người')
})

test('delete comment post',async ()=>{
    await request(app).delete(`/posts/${postIdOne}/comments/${commentIdOne}`).set('authorization',`Bearer ${userOne.tokens[0].token}`).expect(200)

   const commentPost = await Comment.findById(commentIdOne)

   expect(commentPost).toBeNull()
})

test('delete not my comment post',async ()=>{
    await request(app).delete(`/posts/${postIdOne}/comments/${commentIdOne}`).set('authorization',`Bearer ${userTwo.tokens[0].token}`).expect(404)
})
