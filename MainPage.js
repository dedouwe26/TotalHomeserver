const express = require('express')

const router = express.Router()

router.get('/', (_req, res)=>{
    res.sendFile('public/index.html')
})

module.exports = router