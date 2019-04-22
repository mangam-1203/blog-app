var express          =    require("express"),
    app              =    express(),
    bodyParser       =    require("body-parser"),
    methodOverride   =    require("method-override"),
    expressSanitizer =    require("express-sanitizer"),
    passport         =    require("passport"),
    LocalStrategy    =    require("passport-local"),
    passportLocalMongoose=require("passport-local-mongoose"),
    flash            =    require("connect-flash"),
    User             =    require("./models/User"),
    Blog             =    require("./models/blogs"),
    Comment          =    require("./models/comments"),
    mongoose         =    require("mongoose");
mongoose.connect("mongodb://localhost:27017/blog",{useNewUrlParser:true});
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());
app.use(require("express-session")({
    secret:"secret",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(function(req,res,next){
    res.locals.User=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    res.locals.register=req.flash("registered");
    res.locals.login=req.flash("login");
    next();
});

// User.create({
//     userId:"jatin",
//     password:"20@Jatin"
// });
//RESTful routes

app.get("/",function(req,res){
    res.redirect("/blogs");
});

//INDEX

app.get("/blogs",function(req,res){
    
    Blog.find({},function(err,blogs){
        if(err)
        {
            console.log("error_index");
        }
        else
        {
            
            res.render("index",{blogs:blogs,User:req.user});
        }
    });
   
});
//NEW

app.get("/user/:username/blogs/new",isLoggedIn,function(req,res){
    User.findOne(req.body,function(err,user){
        if(err){
            console.log("error");
        }
        else{
             res.render("new",{user:req.user})
        }
        
    })
   
});

//CREATE

app.post("/user/:username/blogs/new",isLoggedIn,function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,function(err,newblog){
       if(err)
       {
           console.log("error_create");
       }
       else
       {
           User.findOne(req.user,function(err,user){
               if(err)
               {
                   console.log(err);
               }
               else{
                   user.blogs.push(newblog);
                   user.save();
                   res.redirect('/blogs');
               }
           });
          
       }
    });
});


// EDIT ROUTE

app.get("/blogs/:id/edit",isLoggedIn,function(req,res){
    User.findOne(req.user,function(err,user){
        if(err)
        {
            console.log(err);
        }
        else{
            Blog.findById(req.params.id,function(err,showblog){
                if(err)
                {
                    console.log("error_edit");
                }
                else
                {
                    res.render("edit",{blog:showblog,user:user});
                }
            });
        }
    });
  
});
//UPDATE

app.put("/blogs/:id",isLoggedIn,function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);    
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updateBlog){
      if(err)
      {
          console.log("error_update");
      }
      else
      {
          res.redirect("/blogs/"+ req.params.id);
      }
    });
});

//DESTROY

app.delete("/blogs/:id",isLoggedIn,function(req,res){
      Blog.findById(req.params.id,function(err,updateBlog){
      if(err)
      {
          console.log("error_delete");
      }
      else
      {
          updateBlog.remove();
          res.redirect("/blogs");
      }
  });
});


//SHOW DOUBT

app.get("/blogs/:id",isLoggedIn,function(req,res){
    Blog.findById(req.params.id).populate('comment').exec(function(err,foundBlog){
        if(err)
        {
            console.log("error");
        }
        else
        {
            res.render("show",{blog:foundBlog,user:req.user});
        }
    })
})
//User route

app.get("/user/:username",isLoggedIn,function(req,res){
    User.findOne(req.user).populate("blogs").exec(function(err,foundUser){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("user",{user:foundUser});
        }
    });
});

//auth routes
app.get("/register",function(req,res){
    res.render("register");
});
app.post("/register",function(req,res){
    var newUser=new User({username:req.body.username});
    User.register(newUser,req.body.password,function(err,user){
        if(err)
        {
            console.log(err);
            return res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                req.flash("registered","you have successfully registerd");
                res.redirect("/blogs");
            });
        }
    });
});

//login
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",passport.authenticate("local",{
    
    failureRedirect:"/login"
}),function(req,res){
    req.flash("login","you have successfully logged in");
    res.redirect("/blogs");
});
//logout
app.get("/logout",function(req,res){
    
    req.flash("success","you have successfully logged out");
    req.logout();
    res.redirect("/login");
});
// //comments
// app.get("/blogs/:id/newComment",isLoggedIn,function(req,res){
//     Blog.findById(req.params.id,function(err,foundBlog){
//         if(err)
//         {
//             console.log("err");
//         }
//         else{
//             res.render("comment",{user:req.user,blogs:foundBlog});
//         }
//     })
    
// });
// app.post("/blogs/:id/comment",function(req,res){
//     Comment.create(req.body.comment,function(err,newComment){
//         if(err)
//         {
//             console.log(err);
//         }
//         else
//         {
//             Blog.findById(req.params.id,function(err,foundBlog){
//                 if(err)
//                 {
//                     console.log("err");
//                 }
//                 else
//                 {
//                     foundBlog.comment.push(newComment);
//                     foundBlog.save();
//                     res.redirect("/blogs/"+foundBlog._id);
//                 }
//             });
//         }
//     });
// });

//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","please log in first");
    res.redirect("/login");
}
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("server is running");
});