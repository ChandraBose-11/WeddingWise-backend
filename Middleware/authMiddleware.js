import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import dotenv from 'dotenv';
dotenv.config()

export const authUser = async (req, res,next) => {
    try {

        const token  = req.headers.authorization.split(' ')[1];

        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        //console.log('Decoded token payload:', decoded);

        const user = await User.findById(decoded.id);

        //console.log(user);
        req.user = user;
        next();
        
    } catch (error) {
        //console.error(error);
        res.status(401).json({ message: 'Unauthorized' });
    }
}