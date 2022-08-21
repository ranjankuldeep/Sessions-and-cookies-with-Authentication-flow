const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const csrf=require('csurf');
const flash=require('connect-flash');
const errorController = require("./controllers/error");
const User = require("./models/user");
const MONGODB_URI =
  "mongodb+srv://kd:rdaZAK7KsHCxCvU3@cluster0.rlzpg.mongodb.net/cluster?retryWrites=true&w=majority";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const csrfprotection=csrf();



const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my little secret",
    resave: false,
    saveUninitialized: false,
    store
  })
);
// this is the session middleware
app.use(csrfprotection);
app.use(flash());


app.use((req, res, next) => {
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    // This is some hard coded user we are fetching
    // and is already there in the database
    // so in a kind every request  we are making is making for this particular user
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req,res,next)=>{
  res.locals.isAuthenticated=req.session.isLoggedIn
  res.locals.csrfToken=req.csrfToken();
  next();
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("connected to the database");
    // User.findOne().then((user) => {
    //   if (!user) {
    //     const user = new User({
    //       name: "kuldeep",
    //       email: "max@test.com",
    //       cart: {
    //         items: [],
    //       },
    //     });
    //     user.save();
    //   }
    // });
    app.listen(3000);
  })
  .catch((err) => {
console.log(err);
  });

//Here note one thing that every req we are sending to particular routes
// we are mandatory passing the route through some compulsory middleware
