//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-amr:meirross@cluster0-r5wpx.mongodb.net/todoListDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const def_item1 = new Item({
  name: "Welcome to our Todo List"
});

const def_item2 = new Item({
  name: "Hit the + button to add a new item."
});

const def_item3 = new Item({
  name: "<---- to delete an item."
});

const def_items = [def_item1, def_item2, def_item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find(function(err, foundItems) {
    if(err) {
      console.log("Error occured!");
    }
    else {
      if(foundItems.length === 0) {
          Item.insertMany(def_items, function(err) {
            if(err) {
              console.log("Error occured!");
            }
          });
          res.redirect("/");
        }
        else {
          res.render("list", {listTitle: "Today", newListItems: foundItems});      
        }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const newItem = new Item({
    name: itemName
  });
  
  if(listName === "Today") {
    newItem.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList) {
      if(err) {
        console.log("Error occured!");
      }
      else {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", function(req, res) {
  const isChecked = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(isChecked, function(err) {
      if(err) {
        console.log("Error occured!");
      }
      else {
        res.redirect("/");
      }
    }); 
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: isChecked}}}, function(err, foundList) {
      if(err) {
        console.log("Error occured!");
      }
      else {
        res.redirect("/" + listName);
      }
    });
  }
}); 

app.get("/:customList", function(req, res) {
  const listName = _.capitalize(req.params.customList);
  List.findOne({name: listName}, function(err, foundList) {
    if(err) {
      console.log("Error occured!");
    }
    else {
      if(!foundList) {
        const item = new List({
          name: listName,
          items: def_items
        });
        item.save();
      }
      else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {

});