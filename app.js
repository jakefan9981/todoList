// intialized needed packages
const express=require("express");
const bodyParser=require("body-parser");
const app = express();
const date=require(__dirname + "/date.js");
const mongoose=require("mongoose");
const https=require("https");

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-jake:139489@cluster0.ap4pl.mongodb.net/todoListDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true });
global.weatherToday="enter a valid city name to know its weather"
global.defaultWeather="enter a valid city name to know its weather"

// mongoDB schemas
const itemSchema={
  name:String
};

const listScheme={
  userName:String,
  weather:String,
  items:[itemSchema]
};

const Item=mongoose.model("item",itemSchema);
const List=mongoose.model("list",listScheme);

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
      res.render("list",{todayIs:today,userNameIs:"home", weatherIs:weatherToday,Items:foundItems});
    }

  });

});

app.get("/:userName",function(req,res){
  let today=date.getDate();
  const userName=req.params.userName;
  console.log(userName);
  List.findOne({userName:userName},function(err,foundList){
    if(err){
      console.log(err);
    }else{
      if(foundList){
        res.render("list",{todayIs:today,userNameIs:foundList.userName,weatherIs:foundList.weather,Items:foundList.items});
      }else{//nothing is found, create new items
        const list = new List({
          userName:userName,
          weather: "enter a valid city name to know its weather",
          items:defaultItems

        });
        list.save();
        res.redirect("/"+userName);
      }
    }
  });
});

// post handling
app.post("/",function(req,res){
  let newItemName=req.body.newItem;
  let userNameForFunction=req.body.submitButton;
  console.log(userNameForFunction);
  const aNewItem=new Item({
    name:newItemName
  });
  if(userNameForFunction==="home"){
    aNewItem.save();
    res.redirect("/");
  }else{
    List.findOne({userName:userNameForFunction},function(err,foundList){
      foundList.items.push(aNewItem);
      foundList.save();
      res.redirect("/"+userNameForFunction);
    });
  }


});

app.post("/delete",function(req,res){
  const deleteItemId=req.body.checkbox;
  const userNameForFunction=req.body.userNameDelete;
  if(userNameForFunction==="home"){
    Item.findByIdAndRemove(deleteItemId,function(err){
      if(err){
        console.log("fail to delete the item with id "+deleteItemId);
      }else{
        console.log("successfully delete the item with id "+deleteItemId);
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({userName:userNameForFunction},{$pull:{items:{_id:deleteItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+userNameForFunction);
      }else{
        console.log(err);
      }
    });
  }

});

app.post("/weather",function(req,res){
  const cityName=req.body.city;
  const userNameForFunction=req.body.userName;
  let cleanUserNameForFunction=userNameForFunction.split(/[ ,]+/);
  console.log(cleanUserNameForFunction)
  cleanUserNameForFunction=cleanUserNameForFunction[0];
  const city="weather?q="+cityName;
  const apiKey="appid=9d279bc47e98624413197164f8307314";
  const unit ="metric";
  const url="https://api.openweathermap.org/data/2.5/";
  var query=url+city+"&"+apiKey
  https.get(query,function(response){
    response.on("data",function(data){
      let weatherObject=JSON.parse(data);
      if(typeof weatherObject.weather === "undefined"){//if user entered invalid city name

        weatherToday="invalid city name";
        if(cleanUserNameForFunction==="home"){
          res.redirect("/");
        }else{//user is in a customized website
          let weatherForFunc="You entered an invalid city name"
          List.findOneAndUpdate({userName:cleanUserNameForFunction},
            {$set:{weather:weatherForFunc}},function(err,foundList){
            if(!err){
              res.redirect("/"+cleanUserNameForFunction);
            }else{
              console.log(err);
            }
          });
        }

      }else{//if user entered a valid city name
        let weather=weatherObject.weather[0].description;
        let weatherForFunc="The weather in "+cityName+": "+weatherObject.weather[0].description;
        let weatherIcon=weatherObject.weather[0].icon;
        weatherToday="The weather in "+cityName+": "+weather;
        if(cleanUserNameForFunction==="home"){
          res.redirect("/");
        }else{
          List.findOneAndUpdate({userName:cleanUserNameForFunction},
            {$set:{weather:weatherForFunc}},function(err,foundList){
            if(!err){
              res.redirect("/"+cleanUserNameForFunction);
            }else{
              console.log(err);
            }
          });
        }
      }

    })

  });

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port,function(){
  console.log("server working");
});
