const express = require('express')
const app = express()


app.get('/',(req,res)=>{
res.send('hiiii')
})

app.listen(3000)
