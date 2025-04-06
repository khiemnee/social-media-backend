import express from 'express'
import auth from '../middleware/auth.js'
import Post from '../models/post.js'
import multer from "multer";


const postRouter = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ 
    dest: 'uploads',
   limits : {
    fileSize:3000000
   },
   fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("Please upload a file image"));
    }
    cb(undefined, true);
  },
  storage
})

postRouter.post(
    "/posts/:id/me/images",
    auth,
    upload.array("uploads",4),
    async (req, res) => {

        const post = await Post.findOne({_id:req.params.id,owner:req.user._id})

        if(!post){
            return res.status(404).send({
                error : 'Post not found'
            })
        }

       const buffers = req.files.map((values)=>values.buffer)


       post.images = buffers

       await post.save()
       res.status(200).send(post)
    },
    (error, req, res, next) => {
      res.status(400).json({ error: error.message });
    }
  );



postRouter.post('/posts',auth,async (req,res) =>{
    try {
        const post = new Post({
          ...req.body,
           owner : req.user._id
        })
        await post.save()
        res.status(201).send(post)
    } catch (error) {
        res.status(501).send(error.message)
    }
})

postRouter.delete('/posts/:id/me',auth,async (req,res) =>{
    try {
        const post = await Post.findOne({_id:req.params.id,owner:req.user._id})

        if(!post){
            return res.status(404).send('post not found')
        }

        await Post.deleteOne({_id:req.params.id})

        res.status(200).send()
    } catch (error) {
        res.status(501).send(error.message)
    }
})

postRouter.patch('/posts/:id/me',auth,async (req,res)=>{
    try {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['content','images']


        const isValid = updates.every((values)=>allowedUpdates.includes(values))

        if(!isValid){
            return res.status(400).send({
                error : 'please enter valid field'
            })
        }

        const post = await Post.findOne({_id:req.params.id,owner:req.user._id})

        if(!post){
            return res.status(404).send('post not found')
        }

        updates.forEach((value)=>post[value] = req.body[value])

        await post.save()

         res.status(200).send(post)

    } catch (error) {
        res.status(500).send()
    }
} )

postRouter.post('/posts/:id/likes',auth,async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id)

        if(!post){
            return res.status(404).send()
        }

        if(post.likes.includes(req.user._id)){
            const userIndex = post.likes.findIndex((value)=>value.equals(req.user._id))
            post.likes.splice(userIndex,1)

            await post.save()
            return res.status(200).send(post)
        }

        post.likes.push(req.user._id)


        await post.save()

        res.status(200).send(post)

    } catch (error) {
        res.status(500).send(error.message)
    }
})

postRouter.get('/posts/:id/likes',auth,async(req,res)=>{
    try {
        const postLikes = await Post.findById(req.params.id).populate('likes')

        res.status(200).send(postLikes.likes)

    } catch (error) {
        res.status(500).send()
    }
})

postRouter.get('/posts',auth,async (req,res)=>{
    try {
        const posts = await Post.find({})

        if(!posts){
            return res.status(404).send()
        }

        res.status(200).send(posts)
    } catch (error) {
        res.status(500).send()
    }
} )


postRouter.get('/posts/me',auth,async (req,res)=>{
    try {
        const posts = await Post.find({owner:req.user._id})

        if(!posts){
            return res.status(404).send()
        }

        res.status(200).send(posts)
    } catch (error) {
        res.status(500).send()
    }
} )







export default postRouter