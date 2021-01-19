//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _= require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Aaron:" + password + "@cluster0.nnmqz.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 1
  }
})

const Item = mongoose.model("Item", itemsSchema)


const item1 = new Item({
  name: "Welcome to the todolist Webapp"
})

const item2 = new Item({
  name: "Select + after typing to add new items"
})

const item3 = new Item({
  name: "<--- Use the checkbox to delete items"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

// Item.updateOne({_id:"5ffcc064c18d4d895d5ee881"},{name:"<---- Hit this to delete an item"}, (err)=>{
//   if (err){
//         console.log(err)
//       } else {
//         console.log("items added")
//       }
//     })



app.get("/", function (req, res) {
  
  

  Item.find((err, results) => {

    if (results.length === 0) {
      Item.insertMany([item1, item2, item3], (err) => {
        if (err) {
          console.log(err)
        } else {
          console.log("items added")
        }
      })
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: results
      });
      console.log(req.body.listName)
    }
  })

});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(req.body.list)

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save()
    res.redirect("/")
  } else {
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    })
  }



  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox
  const listNametest = req.body.listName
  const listName = listNametest.slice(0, -1)

  if (listName === "Today"){
    Item.deleteOne({
      _id: checkedItemId
    }, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log("item deleted")
        res.redirect("/")
      }
    })

  } else {
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}}, (err, foundList)=>{
      if (!err) {
        res.redirect("/"+listName)
        console.log(listName+".")
      } 
    })

  }


})

app.get("/:listname", function (req, res) {
  const newlistname = _.capitalize(req.params.listname)
  

  List.findOne({
    name: newlistname
  }, (err, foundlist) => {
    if (!err) {
      if (!foundlist) {
        const list = new List({
          name: newlistname,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + newlistname)
        console.log('Doesnt exist but was added')

      } else {
        console.log("Exists")
        res.render("list", {
          listTitle: foundlist.name,
          newListItems: foundlist.items
        })
      }
    }

  })





  // res.render("list", {
  //   listTitle: "Work List",
  //   newListItems: workItems
  // });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port==""){
  port = 3000
}

app.listen(port, function () {
  console.log("Server started");
});

