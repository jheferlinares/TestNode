const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const session = require("express-session");
const pool = require("./database/");
const accountRoute = require("./routes/accountRoute");
const inventoryRoute = require("./routes/inventoryRoute");
const staticRoute = require("./routes/static");
const errorHandler = require("./middleware/errorMiddleware");
const cookieParser = require("cookie-parser");
const utilities = require("./utilities/index");
const bodyParser = require("body-parser");
const app = express();
const baseController = require("./controllers/baseController");
const compareRoute = require("./routes/compareRoute");

// Middleware for sessions
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Middleware for cookies
app.use(cookieParser());

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for flash messages
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Middleware to check JWT
app.use(utilities.checkJWTToken);

// View engine setup
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

// Routes - TODAS las rutas deben ir ANTES de los manejadores de error
app.use(staticRoute);
app.get("/", require("./controllers/baseController").buildHome);
app.use("/inv", inventoryRoute); 
app.use("/account", accountRoute);
app.use("/compare", compareRoute); // Movida aquí, antes de los manejadores de error
app.get("/login", (req, res) => {
  res.redirect("/account/login");
});

// Middleware para 404 - DESPUÉS de todas las rutas
app.use((req, res, next) => {
  const error = new Error("Page Not Found");
  error.status = 404;
  next(error);
});

// Error-handling middleware - SIEMPRE al final
app.use(errorHandler);

// Manejo de errores general
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error('Error:', err);
  
  if (err.status === 404) {
    res.status(404).render("errors/error", {
      title: err.message,
      message: err.message,
      nav
    });
  } else {
    res.status(500).render("errors/error", {
      title: "Server Error",
      message: err.message,
      nav
    });
  }
});

// Server information
const port = process.env.PORT;
const host = process.env.HOST;

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
