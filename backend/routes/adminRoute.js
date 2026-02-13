import express from 'express';
import { addDoctor, loginAdmin, allDoctors } from '../controllers/adminController.js';
import authAdmin from '../middlewares/authAdmin.js';
import upload from '../middlewares/multer.js';

const adminRouter = express.Router();

adminRouter.post('/login', loginAdmin);
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
adminRouter.get('/all-doctors', authAdmin, allDoctors);

export default adminRouter;
