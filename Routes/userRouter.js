import express from 'express'
import { deleteUser, updateUser } from '../Controllers/userController.js';
import { verifyToken } from '../Middleware/verifyToken.js';



const router = express.Router();

router.put('/update/:id',verifyToken,updateUser)
router.delete('/delete/:id',verifyToken,deleteUser)


export default router;