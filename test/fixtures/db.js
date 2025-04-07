import mongoose from "mongoose"
import User from "../../src/models/user.js"
import jwt from 'jsonwebtoken'
import Comment from "../../src/models/comment.js";
import Post from "../../src/models/post.js";

export const userIdOne = new mongoose.Types.ObjectId();
export const userIdTwo = new mongoose.Types.ObjectId();
export const postIdOne = new mongoose.Types.ObjectId();
export const commentIdOne = new mongoose.Types.ObjectId();


export const commentOne = {
    _id : commentIdOne,
    user : userIdOne,
    post : postIdOne,
    text : 'đây là comment thứ 1'
}

export const postOne = {
    _id : postIdOne,
    content : 'đây là nội dung',
    owner : userIdOne,
    likes :[
        userIdOne,
    ],
    comments :[
        {

            text : 'đây comment thứ 1',
            createdAt : Date.now(),
            user : userIdOne
        }
    ]

}

export const userOne ={
    _id:userIdOne,
    name:'khiemdeptrai',
    email : 'khiemdeptrai@gmail.com',
    password : 'phamduykhiem2911',
    tokens :[
        {
            token: jwt.sign({_id:userIdOne},process.env.JWT_KEY)
        }
    ]
}

export const userTwo ={
    _id:userIdTwo,
    name:'khiemdeptrai2003',
    email : 'khiemdeptrai2011@gmail.com',
    password : 'phamduykhiem2911',
    tokens :[
        {
            token: jwt.sign({_id:userIdTwo},process.env.JWT_KEY)
        }
    ]
}


export const setupDataBase = async  () =>{
    await User.deleteMany({})
    await Post.deleteMany({})
    await Comment.deleteMany({})
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Post(postOne).save()
    await new Comment(commentOne).save()
}
   
