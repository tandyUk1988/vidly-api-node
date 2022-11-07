const mongoose = require('mongoose');
const URI = "mongodb://localhost:27017";
const PATH = "/playground";

mongoose.connect(`${URI}${PATH}`)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const authorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  website: String
});

const Author = mongoose.model('Author', new mongoose.Schema({
  name: String,
  bio: String,
  website: String
  })
);

const Course = mongoose.model('Course', new mongoose.Schema({
  name: String,
  authors: [authorSchema]
}));

async function addAuthor(courseId, author) {
  const course = await Course.findById(courseId);
  course.authors.push(author);
  course.save();
  console.log("Added Author:", author);
}

async function createCourse(name, authors) {
  const course = new Course({
    name, 
    authors
  }); 
  
  const result = await course.save();
  console.log(result);
}


async function listCourses() { 
  const courses = await Course.find();
  console.log(courses);
}

async function removeAuthor(courseId, authorId) {
  const course = Course.findById(courseId);
  const author = course.authors.id(authorId);
  author.remove();
  course.save();
}

async function updateAuthor(id) {
  const course = await Course.updateOne({ _id: id}, {
    $set: {
      "author.name": "Andy Belcher"
    }
  });
  console.log("Updated course:", course);
}

// addAuthor("6362649248ab6ba5fc6654e1", new Author({ name: "Tony Stark"}));
// createCourse('JavaScript Course', [
//   new Author({ name: 'Mosh' }), 
//   new Author({ name: 'Andy' })
// ]);
// updateAuthor("636262898844ed02153ab621");
removeAuthor("6362649248ab6ba5fc6654e1", "6362657869433b5688cd9fa2");
