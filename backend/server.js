import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'

import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(express.json())
app.use(morgan('dev'))

//routes
app.use('/api/auth',authRoutes)

app.get('/', (req,res)=>{
    res.send({
        message: "Great Success!"
    });
});

//PORT
const PORT = process.env.PORT || 3000 ;


//listener
app.listen(PORT, ()=>{
    console.log(`Server running in ${process.env.DEV_MODE} on localhost:${PORT}`);
});