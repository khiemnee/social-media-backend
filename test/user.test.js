import app from "../src/app.js";
import request from "supertest";
import User from "../src/models/user.js";
import { setupDataBase, userOne,userIdOne } from "./fixtures/db.js";

beforeEach(setupDataBase);

test("create user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "khiem123",
      email: "khiemdeptrai123@gmail.com",
      password: "phamduykhiem2911",
    })
    .expect(201);

  const user = User.findById(response.body._id);
  expect(user).not.toBeNull();
});

test("login user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "khiemdeptrai@gmail.com",
      password: "phamduykhiem2911",
    })
    .expect(200);
});

test("login without exsitting user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: "assdas@gmail.com",
      password: "phamduykhiem2911",
    })
    .expect(400);

  expect(response.body).toEqual({});
});

test("get profile me", async () => {
  await request(app)
    .get("/users/me")
    .set("authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
});


test("get profile me no authenticated", async () => {
  await request(app)
    .get("/users/me")
    .expect(401);
});

test('delete profile me', async()=>{
  await request(app).delete('/users/me').set('authorization',`Bearer ${userOne.tokens[0].token}`).expect(200)
  const user = await User.findById(userIdOne)
  expect(user).toBeNull()
})

test('update profile me',async()=>{
  const response = await request(app).patch('/users/me').send({
    name : 'khiem'
  }).set('authorization',`Bearer ${userOne.tokens[0].token}`).expect(200)

  const user = await User.findById(userIdOne)
  
  expect(response.body).not.toEqual(user)
})

test('update profile wrong field',async()=>{
  await request(app).patch('/users/me').send({
    asdasdasd : 'khiem'
  }).set('authorization',`Bearer ${userOne.tokens[0].token}`).expect(404)
})

test("upload image", async () => {
 const response = await request(app)
    .post("/users/me/avatar")
    .set("authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("image", "test/fixtures/cat.jpg").expect(200);

  

  const user = await User.findById(userIdOne);
  expect(user.avatar).toEqual(expect.any(Buffer));
});
