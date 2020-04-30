//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB", { useNewUrlParser: true });

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
  
  const newItem = new Item({
    name: itemName
  });

  newItem.save();
  res.redirect("/");
});

app.post("/delete", function(req, res) {
  const isChecked = req.body.checkbox;
  Item.findByIdAndRemove(isChecked, function(err) {
    if(err) {
      console.log("Error occured!");
    }
    else {
      res.redirect("/");
    }
  });
}); 

app.get("/:customList", function(req, res) {
  const listName = req.params.customList;

  const newList = new List({
    name: listSchema,
    items: def_items
  });

  newList.save();


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
