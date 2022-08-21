const User = require("../models/user");
const bcrypt=require('bcryptjs');
const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');

// const transporter=nodemailer.createTransport(sendgridTransport({

//   auth:{
//     api_key:''
//   }
// }))

// make an account first to do this setup
exports.getLogin = (req, res, next) => {
  let message=req.flash('error');
  if(message.length>0){

    message=message[0];
  }else{
    message=null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken:req.csrfToken(),
    errorMessage:message
  });
};

exports.postLogin = (req, res, next) => {
  const email=req.body.email;
  const password=req.body.password;
  // req.isLoggedIn = true;
  //this islogged in will not be stored on the req object as in just next line
  //we are killing this particular req by sending a response
  // res.setHeader('Set-Cookie','isLoggedIn=true');//This is used for the setting the cookie
  //so now whenever a req is made there after it browser will automatically set this header in the req
  // with isloggedin = true so we can verify whether customer is already logged in or not
  // this is the core concept of working with the cookie
  // User.findById("62c943cd8f6a82a61642f21f")
  User.findOne({email:email})
    // this user here is userschema by mongoose
    // and thats the reason why it has findbyid method
    // so always remember this concept
    // this keyword clicks very nice
    .then((user) => {
      if(!user){
        req.flash('error', ' Invalid Username or Password');
        return res.redirect('/login');
      }
      bcrypt.compare(password,user.password)
      .then(doMatch=>{
        if(doMatch){
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            // if password do match then return the promise back 
            console.log(err);
            res.redirect("/");
          });
        }
        req.flash('error',' Invalid Username or Password');
        res.redirect('/login');
        // if user password didn't match then he should be refer back to login page 
  
      }).catch(err=>{
        console.log(err);
      })

      // here user is getting stored in the mongodb plane database
      // no mongoose is involved
      // so when we are using the session to attach the fetched user from this plane mongodb database
      // we are attaching only plain data with no userschema model
      // so we are getting deprived of basic function which we set in the user model
    })
    .catch((err) => console.log(err));
  // this is the reason why i am getting error
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {

    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message=req.flash('error');
  if(message.length>0){
    message=message[0];
    console.log(message);
  }else{
    message=null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage:message
  });
};

exports.postSignup = (req, res, next) => {
  console.log("hey i ran this ")
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('error','Email already in use');
        return res.redirect("/signup");
      }
      return bcrypt.hash(password,12).then(
        hashedpassword=>{
          console.log(hashedpassword);
          const user = new User({
            email,
            password:hashedpassword,
            cart: {
              items: [],
            },
          });
          return user.save();
        }
      ).then((result) => {
        res.redirect("/login");
      })
    })
    .catch((err) => console.log(err));
};
