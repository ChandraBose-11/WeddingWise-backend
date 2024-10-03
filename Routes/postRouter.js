import express from 'express';
import { verifyToken } from '../Middleware/verifyToken.js';
import { createPost, getAllPosts } from '../Controllers/postController.js';


const router = express.Router();

router.post('/createpost',verifyToken,createPost)
router.get('/getposts',getAllPosts)

export default router;