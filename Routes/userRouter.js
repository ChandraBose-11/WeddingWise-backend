const express =require ('express')
const Users =require ('../Controllers/userController.js');
const  loginAuth  =require ('../Middleware/verifyToken.js');

const {updateUser,deleteUser}=Users


const router = express.Router();

router.put('/update/:id',loginAuth,updateUser)
router.delete('/delete/:id',loginAuth,deleteUser)


module.exports=router;