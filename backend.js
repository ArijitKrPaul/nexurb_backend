import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import sql from "./db.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

//USER FETCH
app.get("/user", async (req, res) => {
  try {
    const q = await sql`SELECT user_id,name,email FROM users`;
    return res.status(200).json(q);
  } catch (err) {
    return res.status(404).json("error has occured");
  }
});

// REGISTER
app.post("/register", async (req, res) => {
  console.log(req);
  const role = "user";

  try {
    const existingUser =
      await sql`SELECT user_id FROM users WHERE email = ${req.body.email}`;

    console.log(existingUser);

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // insert user
    await sql`INSERT INTO users (name, email, password,role) VALUES (${req.body.name}, ${req.body.email}, ${hashedPassword},${role})`;

    res.status(201).json({ message: "User successfully added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error has occurred" });
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    const existingUser =
      await sql`select * from users where email=${req.body.email}`;
    console.log(existingUser);

    if (existingUser.length === 0)
      return res.status(500).json("User not found!");

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      existingUser[0].password,
    );

    if (!isPasswordCorrect)
      return res.status(500).json("Wrong username or password!");

    return res.status(200).json(existingUser[0]);
  } catch (err) {
    return res.status(500).json("Error has occured");
  }
});

//PROJECT PAGE
app.post("/project", async (req, res) => {
  try {
    await sql`INSERT into project ("Name","type","description","dept_name","state","city") VALUES (${req.body.name},${req.body.type},${req.body.description},${req.body.dept_name},${req.body.state},${req.body.city})`;

    res.status(201).json("project added");
  } catch (err) {
    console.log(err);
    return res.status(500).json("error has occured");
  }
});

app.get("/project", async (req, res) => {
  try {
    const q =
      await sql`SELECT * from project where state like ${req.query.state} and city like ${req.query.city}`;
    return res.status(200).json(q);
  } catch (err) {
    console.log(err);
    return res.status(404).json("error has occured");
  }
});

//DEPT_REG
app.post("/deptRegister", async (req, res) => {
  try {
    const q =
      await sql`INSERT into notify("dept_name","state","city","location","user_id") VALUES (${req.body.name},${req.body.state},${req.body.city},${req.body.location},${req.body.user_id})`;
    return res.status(200).json("dept added");
  } catch (err) {
    return res.status(400).json("error has occured");
  }
});

//DEPT FETCH for notification
app.get("/deptRegister", async (req, res) => {
  try {
    const q = await sql`SELECT * from notify`;
    return res.status(200).json(q);
  } catch (err) {
    return res.status(404).json("error has occured");
  }
});

//DEPT DECLINE
app.delete("/deptRegister/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await sql`DELETE FROM notify WHERE id = ${id}`;
    return res.status(200).json("deleted successfully");
  } catch (err) {
    return res.status(404).json("error has occured");
  }
});

//Dept ACCEPT
app.post("/deptAccept", async (req, res) => {
  console.log(req.body, 1);
  try {
    const q =
      await sql`INSERT into departments(dept_id,name,state,city,location) VALUES(${req.body.id},${req.body.name},${req.body.state},${req.body.city},${req.body.location})`;

    return res.status(200).json("dept added");
  } catch (err) {
    console.log(err);
    return res.status(404).json("err");
  }
});

//Registered Departments fetching
app.get("/deptAccept", async (req, res) => {
  try {
    const data =
      await sql`SELECT dept_id,name, state, city, location FROM departments`;
    return res.status(200).json(data);
  } catch (err) {
    console.error("Route error:", err);
    return res.status(500).json({ error: "Route crashed" });
  }
});

//inventory adding a new product
app.post("/addItem", async (req, res) => {
  try {
    const q =
      await sql`INSERT into products(name,quantity,price,dept_id,unit) VALUES(${req.body.name},${req.body.quantity},${req.body.price},${req.body.dept_id},${req.body.unit})`;
    return res.status(200).json({
      message: "item added",
    });
  } catch (error) {
    return res.status(404).json({
      message: "error has occured",
    });
  }
});
//getting inventory products
app.get("/product/:dept_id", async (req, res) => {
  const id = req.params.dept_id;

  try {
    const q =
      await sql`SELECT product_id,name,price,quantity from products where dept_id=${id}`;
    console.log(q);
    return res.status(200).json(q);
  } catch (error) {
    return res.status(400).json({
      message: "error has occured while fetching data",
    });
  }
});

//updating inventory products
app.put("/updateItem", async (req, res) => {
  try {
    const q =
      await sql`UPDATE products SET quantity=${req.body.quantity} WHERE product_id=${req.body.product_id} and dept_id=${req.body.dept_id}`;
    return res.status(200).json({
      message: "item updated successfully",
    });
  } catch (error) {
    return res.status(404).json({
      message: "update failed",
    });
  }
});

//deleting inventory item
app.delete("/deleteItem", async (req, res) => {
  try {
    const q =
      await sql`DELETE from products where product_id=${req.body.product_id} and dept_id=${req.body.dept_id}`;
    return res.status(200).json("deleted successfully");
  } catch (error) {
    return res.status(400).json({
      message: "delete failed",
    });
  }
});

//fetching users with the role of user
app.get("/newUser", async (req, res) => {
  try {
    const q = await sql`SELECT user_id,name,email FROM users where role='User'`;
    return res.status(200).json(q);
  } catch (err) {
    return res.status(404).json("error has occured");
  }
});

app.put("/updateUser", async (req, res) => {
  try {
    await sql`
      UPDATE USERS 
      SET role = ${req.body.role},
          dept_id = ${req.body.dept_id}
      WHERE user_id = ${req.body.user_id}
    `;

    return res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(400).json({
      error: error.message,
    });
  }
});

app.get("/deptUsers", async (req, res) => {
  try {
    const data =
      await sql`select user_id,name,email,role from users where dept_id=${req.query.dept_id} and role in('Project Manager','Inventory Manager','Employee','Support')`;
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "error has occured while fetching users" });
  }
});

//adding dept to user on accepting dept req notification
app.put("/addDeptId", async (req, res) => {
  try {
    await sql`
      UPDATE USERS 
      SET dept_id = ${req.body.id},
          role='Admin'
      WHERE user_id = ${req.body.user_id}
    `;
  } catch (error) {
    return res.status(400).json({
      message: "error as occured",
    });
  }
});

app.put("/delUser", async (req, res) => {
  try {
    const data =
      await sql`UPDATE USERS SET role='User',dept_id=NULL where user_id=${req.body.user_id}`;
    return res.status(200).json("Role updated successfully");
  } catch (error) {
    console.log(error);
  }
});

app.put("/updateRole", async (req, res) => {
  try {
    const q =
      await sql`UPDATE USERS SET role=${req.body.role} where user_id=${req.body.user_id}`;
    return res.status(200).json("Role updated successfully");
  } catch (error) {
    console.log(error);
    return res.status(400).json("Error has occured while updating the role");
  }
});

app.get("/", (req, res) => {
  res.send("Server running successfully");
});

app.listen(5000, () => {
  console.log("Server connected on port 5000");
});
