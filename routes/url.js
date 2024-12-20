const create=require('../controllers/url')
const analytics=require('../controllers/url')
const express=require('express')
const router=express.Router()
router.post('/shorten',create)
router.get('/analytics/:shortId',analytics)
module.exports=router