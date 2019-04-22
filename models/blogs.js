var mongoose=require("mongoose")
var blogschema=new mongoose.Schema({
    title   : String,
    image   : String,
    body    : String,
    created : {type:Date ,default:Date.now},
    comment :
    [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
});
module.exports=mongoose.model("Blog",blogschema);