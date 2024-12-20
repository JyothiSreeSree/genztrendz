const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
  })
);

const secret_key = "MY_SECRET_KEY";

const dbPath = path.join(__dirname, "genztrendzdb.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on port 3000...");
    });
  } catch (e) {
    console.log(`DB error : ${e.message}`);
    process.exit(1);
  }
};
const createUserDetailsTable = async () => {
  await db.exec(
    `CREATE TABLE IF NOT EXISTS userdetails(
            username VARCHAR PRIMARY KEY,
            password VARCHAR
        ) `
  );
};

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const getUsernameQuery = `SELECT * from userdetails WHERE username="${username}"`;
  const dbUsername = await db.get(getUsernameQuery);
  if (dbUsername === undefined) {
    const insertingUserDetailsQuery = `
        INSERT INTO userdetails(username,password)
        VALUES ('${username}','${hashedPassword}')`;
    await db.run(insertingUserDetailsQuery);

    res.status(200).send({ message: "Account created successfully" });
  } else {
    res.status(400);
    res.send({ error_msg: "User already exists" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const getUsernameQuery = `SELECT * from userdetails WHERE username="${username}"`;
  const dbUsername = await db.get(getUsernameQuery);
  if (dbUsername === undefined) {
    res.status(400);
    res.send({ error_msg: "Invalid Username" });
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      dbUsername.password
    );
    if (isPasswordMatched === true) {
      const payload = { username: dbUsername.username };
      const token = jwt.sign(payload, secret_key, { expiresIn: "1h" });
      res.status(200).send({ message: "Login Successful", token });
    } else {
      res.status(400);
      res.send({ error_msg: "Invalid Password" });
    }
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { order, sortBy, category, search, rating, limit, offset } =
      req.query;
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();
    let products = data.products;
    if (category) {
      products = products.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      products = products.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (rating) {
      const minRating = parseFloat(rating);
      products = products.filter((product) => product.rating >= minRating);
    }

    if (sortBy) {
      if (order === "desc") {
        products.sort((a, b) => b.price - a.price);
      } else if (order === "asc") {
        products.sort((a, b) => a.price - b.price);
      }
    }
    const limitInt = parseInt(limit) || 6;
    const offsetInt = parseInt(offset) || 0;
    const paginatedProducts = products.slice(offsetInt, offsetInt + limitInt);

    res.status(200).json({
      products: paginatedProducts,
      total: products.length,
      limit: limitInt,
      offset: offsetInt,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

initializeDBAndServer().then(createUserDetailsTable);
