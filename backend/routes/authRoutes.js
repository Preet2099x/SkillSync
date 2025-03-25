import express from 'express';
import { 
  candidateRegisterController, 
  companyRegisterController, 
  loginController,  
} from '../controllers/authController.js';

import { requireSignin } from '../middlewares/authMiddlewares.js';

// Router object
const router = express.Router();

// Candidate Registration || POST METHOD
router.post('/register/candidate', candidateRegisterController);

// Company Registration || POST METHOD
router.post('/register/company', companyRegisterController);

// Login (Common for Candidates & Companies) || POST METHOD
router.post('/login', loginController);


export default router;
