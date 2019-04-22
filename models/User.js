var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema=new mongoose.Schema({
    username   : String,
    password : String,
    blogs    : [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Blog"
        }
        
        ],
    first_name:String,
    second_name:String,
    phone_Number:String,
    email:String,
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    }
      
    
});
userSchema.plugin(passportLocalMongoose);
var User = module.exports=mongoose.model("User",userSchema);
module.exports=User;