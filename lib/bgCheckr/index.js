import express from 'express'

import createCandidates from './checkr/create.js';


const router = express.Router();


//----create candidate checkr -------------//
router.post("/createCandidates", createCandidates)


 export default router
