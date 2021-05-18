const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vdmb9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const port = 5000;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is Working!");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const studentCollection = client
    .db(process.env.DB_NAME)
    .collection("student");

  // Get all students
  app.get("/students", (req, res) => {
    studentCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Get a student details
  app.get("/student/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    studentCollection.find({ _id: id }).toArray((err, items) => {
      res.send(items);
    });
  });

  // insert order info to database
  app.post("/addStudent", (req, res) => {
    const newStudent = req.body;
    console.log("adding new student", newStudent);
    studentCollection.insertOne(newStudent).then((result) => {
      console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  // update student detail
  app.patch("/update/:id", (req, res) => {
    console.log("updating student");
    studentCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            name: req.body.name,
            gender: req.body.gender,
            class: req.body.class,
            studying: req.body.studying,
          },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });

  // delete a student
  app.delete("/deleteStudent/:id", (req, res) => {
    console.log("On delete");
    const id = ObjectId(req.params.id);
    console.log("delete this", id);
    studentCollection
      .findOneAndDelete({ _id: id })
      .then((documents) => res.send(!!documents.value));
  });

  // read all services data from database
  //   app.get("/getServices", (req, res) => {
  //     servicesCollection.find().toArray((err, documents) => {
  //       res.send(documents);
  //     });
  //   });
});

app.listen(
  process.env.PORT || port,
  console.log("Server Running on http://localhost:" + port)
);
