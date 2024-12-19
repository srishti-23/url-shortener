const create=require('../controllers/url')
const analytics=require('../controllers/url')
const express=require('express')
const router=express.Router()
router.post('/',create)
router.get('/analytics/:shortId',analytics)
module.exports=router