const express = require('express');
require('express-async-errors');
require("dotenv").config(); // to load the .env file into the process.env object


const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require('connect-flash')
const csrf = require('./middleware/csrf')

let secretWord = "syzygy";



// express app initialization 
const app = express();
app.set("view engine", "ejs");


//Security Middleware 
app.use(helmet()); // Adds security headers
app.use(xss()); // Prevents XSS attacks


// Rate limiting: limits requests from the same IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);


//Parsing Middleware


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Session middleware
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));
app.use(flash());



// Passport 
 
const passport = require("passport");
const passportInit = require("./passport/passportInit");
passportInit();
app.use(passport.initialize());
app.use(passport.session());
  
// flash

app.use(require("./middleware/storeLocals"));
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


//CSRF MiddleWare 
const csrf_development_mode = true;
if (app.get("env") === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}
app.use(csrf(csrf_development_mode));







//Routes 
const jobs = require("./routes/jobs"); // Import the jobs route
const auth  = require("./middleware/auth"); // Import authentication middleware
const secretWordRouter = require("./routes/secretWord");
const sessionRoutes = require("./routes/sessionRoutes")

//define routes after imports 
app.use("/jobs", auth, jobs);
app.use("/sessions", sessionRoutes);
app.use("/secretWord", auth, secretWordRouter);

//home route 
app.get("/", (req, res) => {
  res.render("index");
});



// Error Handling 

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});




// server startup 

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    //add this line just before listen line
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();











