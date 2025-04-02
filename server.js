/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const errorHandler = require("./middleware/errorMiddleware") // Import error middleware
const errorRoute = require("./routes/errorRoute") // Import error route
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute") // Import account routes
const bodyParser = require("body-parser")
/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Middleware to parse form data
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(require("./routes/static"))
app.get("/", baseController.buildHome)
// Inventory routes
app.use("/inv", inventoryRoute)
// Error route
app.use("/", errorRoute) // Add the intentional error route
app.use("/account", accountRoute)
// Serve static files


/* ***********************
 * Middleware for 404 Errors
 *************************/
app.use((req, res, next) => {
  const error = new Error("Page Not Found")
  error.status = 404
  next(error) // Pass the error to the error-handling middleware
})

/* ***********************
 * Error-Handling Middleware
 *************************/
app.use(errorHandler) // Use the error-handling middleware

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

