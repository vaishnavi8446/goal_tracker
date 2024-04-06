const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/goalTracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// Goal Schema
const goalSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  goalName: String,
  minTimeline: Date,
  maxTimeline: Date,
});
const Goal = mongoose.model("Goal", goalSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
  goalId: mongoose.Schema.Types.ObjectId,
  taskName: String,
  quantity: Number,
  frequency: String,
  daysOfWeek: [Number],
  reminders: [Date],
});
const Task = mongoose.model("Task", taskSchema);

// UserLog Schema
const userLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  goalId: mongoose.Schema.Types.ObjectId,
  taskId: mongoose.Schema.Types.ObjectId,
  logDate: Date,
  quantityCompleted: Number,
});
const UserLog = mongoose.model("UserLog", userLogSchema);

// Function to generate JWT token
function generateToken(user) {
  return jwt.sign({ id: user._id }, "secretKey", { expiresIn: "1h" });
}

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "Token not provided" });

  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Failed to authenticate token" });

    req.userId = decoded.id;
    next();
  });
}

// API to create a new user
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email or username already exists in the database
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with the provided email or username",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({
      status_code: 201,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid password" });

    const token = generateToken(user);
    res.status(200).json({
      status_code: 200,
      message: "User Logged In Successfully!",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to create a new goal
app.post("/api/goals", verifyToken, async (req, res) => {
  try {
    const { userId, goalName, minTimeline, maxTimeline } = req.body;

    const existingGoalsCount = await Goal.countDocuments({ userId });
    if (existingGoalsCount >= 2) {
      return res
        .status(400)
        .json({ message: "User already has maximum goals" });
    }

    const goal = new Goal({ userId, goalName, minTimeline, maxTimeline });
    await goal.save();
    res.status(201).json({
      status_code: 201,
      message: "Goal created successfully",
      data: goal,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to create a new task
app.post("/api/tasks", verifyToken, async (req, res) => {
  try {
    const { goalId, taskName, quantity, frequency, daysOfWeek, reminders } =
      req.body;

    // Validate frequency
    const validFrequencies = ["daily", "twice_daily", "weekly"];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({ message: "Invalid frequency" });
    }

    // Validate daysOfWeek for weekly frequency
    if (frequency === "weekly" && (!daysOfWeek || daysOfWeek.length === 0)) {
      return res.status(400).json({
        message: "Days of week must be specified for weekly frequency",
      });
    }

    // Validate reminders
    if (reminders && !Array.isArray(reminders)) {
      return res.status(400).json({ message: "Reminders must be an array" });
    }

    const task = new Task({
      goalId,
      taskName,
      quantity,
      frequency,
      daysOfWeek,
      reminders,
    });
    await task.save();
    res.status(201).json({
      status_code: 201,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to log user activity
app.post("/api/userlogs", verifyToken, async (req, res) => {
  try {
    const { userId, goalId, taskId, logDate, quantityCompleted } = req.body;
    const userLog = new UserLog({
      userId,
      goalId,
      taskId,
      logDate,
      quantityCompleted,
    });
    await userLog.save();
    res.status(201).json({
      status_code: 201,
      message: "User activity logged successfully",
      data: userLog,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to get user's goals and tasks
app.get("/api/dashboard", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const goals = await Goal.find({ userId });
    const tasks = await Task.find({
      goalId: { $in: goals.map((goal) => goal._id) },
    });
    res.status(200).json({
      status_code: 200,
      message: "Dashboard shown successfully!",
      goals,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
