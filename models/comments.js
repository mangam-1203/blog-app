var mongoose=require('mongoose');
var commentSchema=new mongoose.Schema({
    comment:String,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        username:String
    }
});

module.exports=mongoose.model("Comment",commentSchema);