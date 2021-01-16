// intialized needed packages
const express=require("express");
const bodyParser=require("body-parser");
const app = express();
const date=require(__dirname + "/date.js");
const mongoose=require("mongoose");

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
mongoose.connect("mongodb+srv://cluster0.ap4pl.mongodb.net/todoListDBg" , {useNewUrlParser: true, useUnifiedTopology: true });

// mongoDB schemas
const itemSchema={
  name:String
};

const Item=mongoose.model("item",itemSchema);

const defaultItem1=new Item({
  name:"welcome to your to-do list"
});
const defaultItem2=new Item({
  name:"Hit the + button to add a new item"
});
const defaultItem3=new Item({
  name:"<--- Hit this to delete an item "
});

let defaultItems=[defaultItem1,defaultItem2,defaultItem3];



// website functions
app.get("/",function(req,res){
  let today=date.getDate();
  Item.find({},function(err,foundItems){
    console.log(foundItems.length);
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully add the default items");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{todayIs:today, Items:foundItems});
    }

  });

});

app.post("/",function(req,res){
  let newItemName=req.body.newItem;
  const aNewItem=new Item({
    name:newItemName
  });
  aNewItem.save();
  res.redirect("/");
});

app.post("/delete",function(req,res){
  const deleteItemId=req.body.checkbox;
  Item.findByIdAndRemove(deleteItemId,function(err){
    if(err){
      console.log("fail to delete the item with id "+deleteItemId);
    }else{
      console.log("successfully delete the item with id "+deleteItemId);
    }

  });
  res.redirect("/");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port,function(){
  console.log("server working");
});
