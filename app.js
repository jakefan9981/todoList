// intialized needed packages
const express=require("express");
const bodyParser=require("body-parser");
const app = express();
const date=require(__dirname + "/date.js");
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
let items=["placeholder1","placeholder1","placeholder3"];


// website functions
app.get("/",function(req,res){
  let today=date.getDate();
  res.render("list",{todayIs:today, Items:items});
});

app.post("/",function(req,res){
  let newItem=req.body.newItem;
  items.push(newItem);
  res.redirect("/");
});

app.listen(3000,function(){
  console.log("server working");
});
