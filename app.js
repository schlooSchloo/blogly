/*  To Do:
      * 
  
*/

import * as fs from "fs";
import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const imgUpload = multer({ storage: storage });

// read all blog post content
async function readAllPosts() {
  try {
    // read names of all files in "blog-posts" directory
    const files = await new Promise((resolve, reject) => {
      fs.readdir(path.join(__dirname, "blog-posts"), (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    // read contents of each file and parse them
    const blogPosts = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(__dirname, "blog-posts", file);
        const content = await new Promise((resolve, reject) => {
          fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
        return JSON.parse(content);
      })
    );

    return blogPosts;
  } catch (error) {
    console.error("Error reading files:", error);
    res.status(500).send("Internal Server Error");
  }
}

function sortBlogPosts(blogPosts) {
  //// reverse sort blog posts based on id (i.e. the latest blog post will appear first in the array)

  blogPosts = blogPosts.sort((a, b) => {
    if (Number(a.id) > Number(b.id)) {
      return -1;
    } else {
      return 1;
    }
  });
  return blogPosts;
}

function findPostPath(postID) {
  return path.join(__dirname, `blog-posts/blog-post-${postID}.json`);
}

function readOneBlogPost(postID) {
  const postPath = findPostPath(postID);
  const blogPost = fs.readFileSync(postPath, "utf-8", (err, data) => {
    if (err) throw err;
    return data;
  });
  // console.log(blogPost);
  return blogPost;
}

async function deletePost(postID) {
  const postPath = findPostPath(postID);
  try {
    await new Promise((resolve, reject) => {
      fs.unlink(postPath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    console.log(`Blog Post with ID ${postID} has been successfully deleted`);
  } catch (err) {
    console.log(err);
  }
}

function getTodaysDate() {
  //// Get today's date and format it to "DD-MMM-YYYY"
  var date = new Date();
  const formattedDate = date
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
  return formattedDate;
}

async function getNewPostID() {
  //// Create a PostID for a new blog post (max existing postID + 1)
  try {
    const blogPosts = await readAllPosts();
    const sortedPosts = await sortBlogPosts(blogPosts);
    return Number(sortedPosts[0].id) + 1;
  } catch (err) {
    console.log(err);
  }
}

async function saveBlogPost(post, imgSrc) {
  //// Update Post Metadata and Save Post Content and Image

  try {
    // If new blog post: Create new Post ID and update created and updated dates
    // If existing blog post: Only update 'updated date'
    const todaysDate = getTodaysDate();
    if (post.postID == 0) {
      post.postID = String(await getNewPostID());
      post.createdDate = todaysDate;
      post.updatedDate = todaysDate;
    } else {
      post.updatedDate = todaysDate;
    }
    post.imgSrc = imgSrc;
    post = new BlogPost(post);
    const postFileName = createFileName(post.id);

    saveBlogContent(postFileName, post);
    return post.id;
  } catch (err) {
    console.log(err);
  }
}

//// Remove the first element returned by form for section title and content (from section tempate)
function removeTemplateContent(array) {
  array.shift();
  return array;
}

//// Create file name for blog post
function createFileName(postID) {
  return "blog-post-" + postID + ".json";
}

async function saveBlogContent(postFileName, post) {
  try {
    fs.writeFile(
      path.join(__dirname, "blog-posts", postFileName),
      JSON.stringify(post),
      (err) => {
        if (err) throw err;
        console.log(`${postFileName} saved successfully`);
      }
    );
  } catch (err) {
    console.log(err);
  }
}

class BlogPost {
  constructor(post) {
    this.id = post.postID;
    this.imgSrc = post.imgSrc;
    this.created = post.createdDate;
    this.updated = post.updatedDate;
    this.title = post.title;
    this.subheader = post.subheader;
    this.section = removeTemplateContent(post.sectionTitle);
    this.content = removeTemplateContent(post.sectionContent);
  }
}

app.use(express.static("public"));

// app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  readAllPosts()
    .then((allPosts) => {
      // console.log(allPosts.length);
      const sortedPosts = sortBlogPosts(allPosts);
      // console.log(sortedPosts.slice(0, 3));
      res.render("index.ejs", { blogPosts: sortedPosts.slice(0, 3) });
    })
    .catch((error) => {
      console.error("Error reading file:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/view-all", (req, res) => {
  readAllPosts()
    .then((allPosts) => {
      // console.log(allPosts.length);
      res.render("all-blogs.ejs", { blogPosts: allPosts });
    })
    .catch((error) => {
      console.error("Error reading file:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/read-blog", (req, res) => {
  try {
    const postID = req.query.postID;
    console.log("get request made for /read-blog");
    console.log("Blog Post requested: ", postID);
    const blogPost = JSON.parse(readOneBlogPost(postID));
    console.log("Blog Post Returned: ", blogPost.title);

    res.render("read-blog.ejs", {
      id: blogPost.id,
      imgSrc: blogPost.imgSrc,
      created: blogPost.created,
      updated: blogPost.updated,
      title: blogPost.title,
      subheader: blogPost.subheader,
      section: blogPost.section,
      content: blogPost.content,
    });
  } catch {
    console.error("Error rendering /read-blog page:", error);
    res.status(500).send("Internal Server Error");
  }
});

//// Create new blog post
app.get("/create-post", (req, res) => {
  res.render("create-post.ejs");
});

//// Edit existing blog post
app.get("/edit-post", (req, res) => {
  // Add logic to load respective blog post in correct fields
  try {
    const postID = req.query.postID;
    const blogPost = JSON.parse(readOneBlogPost(postID));

    res.render("create-post.ejs", {
      id: blogPost.id,
      imgSrc: blogPost.imgSrc,
      created: blogPost.created,
      updated: blogPost.updated,
      title: blogPost.title,
      subheader: blogPost.subheader,
      section: blogPost.section,
      content: blogPost.content,
    });
  } catch {
    console.error("Error rendering /edit-post page: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// Publish new or edited blog post content and redirect user to their published blog
app.post("/publish-post", imgUpload.single("cover-image"), (req, res) => {
  let blogPost = req.body;

  if (!req.file) {
    // No image upload indicates the user wants to continue using their old cover image. Read imgSrc from original blog post
    const imgSrc = JSON.parse(readOneBlogPost(blogPost.postID)).imgSrc;

    saveBlogPost(blogPost, imgSrc).then((postID) => {
      console.log(`Blog Post with postID = ${postID} updated successfully!`);

      res.redirect(`/read-blog?postID=${postID}`); //should send user to their published blog
    });
  } else {
    let fileName = req.file.originalname;

    saveBlogPost(blogPost, fileName).then((postID) => {
      console.log(`Blog Post with postID = ${postID} updated successfully!`);

      res.redirect(`/read-blog?postID=${postID}`); //should send user to their published blog
    });
  }
});

// delete selected blog post from file store
app.delete("/delete-post", (req, res) => {
  const postID = req.query.postID;
  console.log("deleting post...", postID);
  deletePost(postID);
  res.json({ message: "Resource deleted successfully" });
  // return res.redirect("all-blogs.ejs");
});

app.listen(port, (req, res) => {
  console.log(`Listening on port: ${port}`);
});
