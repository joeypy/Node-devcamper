const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
const morgan = require('morgan')
const connectDB = require('./config/db')
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const errorHandler = require('./middleware/error')


// ------------------------------------ ENV CONFIG ---------------------------------------- // 
// Load en variables
dotenv.config({ path: './config/config.env'})


// ---------------------------------- DB CONNECTION ---------------------------------------- // 
// Connect to database
connectDB()


// ----------------------------------- EXPRESS ---------------------------------------- // 
// Server Express
const app = express()
// Body Parser
app.use(express.json())


// ---------------------------------- MIDDLEWARE ------------------------------------ // 
// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}


// ----------------------------------- ROUTES ---------------------------------------- // 
// Mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)


// ---------------------------------- MIDDLEWARE ERROR ------------------------------------ // 
// Handle error routes middleware
app.use(errorHandler)


// ------------------------------------ SERVER ---------------------------------------- // 
const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
)

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
    // Close server & exit process
    server.close( () => process.exit(1))
})