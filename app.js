const express = require("express");
const app = express();
const userModal = require("./models/user");
const postModal = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  let user = await userModal
    .findOne({ email: req.user.email })
    .populate("posts");

  res.render("profile", { user });
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModal.findOne({ _id: req.params.id }).populate("user");
  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }

  await post.save();

  res.redirect("/profile");
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await postModal.findOne({ _id: req.params.id }).populate("user");

  res.render("edit", { post });
});

app.post("/update/:id", isLoggedIn, async (req, res) => {
  let post = await postModal.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );

  res.redirect("/profile");
});
app.post("/post", isLoggedIn, async (req, res) => {
  let user = await userModal.findOne({ email: req.user.email });
  let { content } = req.body;
  const post = await postModal.create({
    user: user._id,
    content,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

app.post("/register", async (req, res) => {
  let { email, password, username, name, age } = req.body;
  let user = await userModal.findOne({ email });
  if (user) return res.status(500).send("User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModal.create({
        username,
        email,
        age,
        name,
        password: hash,
      });

      let token = jwt.sign({ email: email, userid: user._id }, "shhhhhh");
      res.cookie("token", token);

      res.send("register");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModal.findOne({ email });
  if (!user) return res.status(500).send("Something is wrong");

  bcrypt.compare(password, user.password, async (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "shhhhhh");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else res.redirect("/login");
  });
});

app.get("/logout", async (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") res.redirect("/login");
  else {
    let data = jwt.verify(req.cookies.token, "shhhhhh");
    req.user = data;
    next();
  }
}

app.listen(3000);
