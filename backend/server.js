const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require('nodemailer'); // Add Nodemailer dependency

const app = express();

// Disable x-powered-by header to prevent server fingerprinting
app.disable('x-powered-by');

// Security headers middleware (equivalent to helmet)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// In-memory rate limiter (no external dependency)
const rateLimitStore = new Map();
const createRateLimiter = (windowMs, maxRequests) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key).filter(t => t > windowStart);
    rateLimitStore.set(key, requests);

    if (requests.length >= maxRequests) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    requests.push(now);
    next();
  };
};

// Clean up expired rate limit entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitStore) {
    const filtered = timestamps.filter(t => t > now - 900000);
    if (filtered.length === 0) rateLimitStore.delete(key);
    else rateLimitStore.set(key, filtered);
  }
}, 60000);

// Rate limiters for different endpoint groups
const authLimiter = createRateLimiter(15 * 60 * 1000, 20); // 20 attempts per 15 min
const contactLimiter = createRateLimiter(60 * 60 * 1000, 10); // 10 contact forms per hour

const PORT = 5008;
const JWT_SECRET = "4953546c308be3088b28807c767bd35e99818434d130a588e5e6d90b6d1d326e";
const GOOGLE_CLIENT_ID = "435475456119-dsajbk8ujprqvig0nua0g9qfmmks5v2j.apps.googleusercontent.com";
const MONGO_URI = "mongodb+srv://varun:454697@ksp.gqt0t.mongodb.net/M_v?retryWrites=true&w=majority";

// Update JWT expiration to one day
const JWT_EXPIRATION = "1d"; // 1 day

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size to prevent abuse
const allowedOrigins = new Set([
  "https://ksp-gamma.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ksp.varunm.tech",
]);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser/server-to-server requests and known browser origins.
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Initialize Google OAuth client outside any route
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    
   
    const lastProduct = await Product.findOne({}).sort({ id: -1 });
    const maxId = lastProduct ? lastProduct.id : 0;
    await Counter.findByIdAndUpdate(
      "productId",
      { seq: maxId },
      { upsert: true, new: true }
    );
    console.log(`Counter set to ${maxId}`);
    
   
    try {
      await mongoose.connection.collection("products").dropIndex("id_1");
      console.log("Dropped existing index");
    } catch (error) {
      console.log("No existing index to drop");
    }
    await Product.collection.createIndex({ id: 1 }, { unique: true });
    console.log("Created new unique index");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Counter Schema for auto-incrementing IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model("Counter", counterSchema);

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
  phone: { type: String },
  address: { type: String },
  profileImage: { type: String },
  lastLogin: { type: Date, default: Date.now },
  preferences: {
    notifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false },
  },
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  wishlist: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String },
      description: { type: String },
      category: { type: String },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  lastUpdated: { type: Date },
});

// Add indexes before model compilation
userSchema.index({ googleId: 1 }, { sparse: true });

const User = mongoose.model("User", userSchema);

// Contact Schema
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now, expires: "7d" },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Allow guest checkout
  },
  userEmail: { type: String, required: true },
  userName: { type: String, required: false, default: "Guest User" },
  orderItems: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
      productId: { type: String, required: true },
    },
  ],
  shippingInfo: {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true }, // Add phone field
  },
  deliveryMethod: {
    type: String,
    required: true,
    enum: ["standard", "express"],
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["razorpay", "cod"],
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
  },
  subtotal: { type: Number, required: true },
  deliveryPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true },
  orderStatus: {
    type: String,
    required: true,
    enum: ["processing", "shipped", "delivered", "cancelled"],
    default: "processing",
  },
  orderReference: { type: String, required: true, unique: true },
  notes: [{ type: String }],
}, { timestamps: true });

// Add indexes for frequently queried fields
orderSchema.index({ userEmail: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderReference: 1 }, { unique: true });

const Order = mongoose.model("Order", orderSchema);

// Product Schema (updated to include fields from both versions)
const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save middleware for auto-incrementing product ID
productSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const counter = await Counter.findByIdAndUpdate(
        "productId",
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      this.id = counter.seq;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Product = mongoose.model("Product", productSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token. Please log in again." });
    }
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Internal server error during token verification." });
  }
};

// Helper function to format the product response
const formatProduct = (product) => ({
  id: product.id,
  _id: product._id,
  name: product.name,
  description: product.description,
  price: product.price,
  category: product.category,
  rating: product.rating || 0,
  image: product.image.startsWith('data:') ? product.image : `data:image/png;base64,${product.image}`,
  stock: product.stock,
  createdAt: product.createdAt
});

// Login Endpoint
app.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: "This account uses Google login. Please use Google to sign in." });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    return res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        profileImage: user.profileImage || null 
      }, 
      token,
      authProvider: "email" 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Signup Endpoint
app.post("/signup", authLimiter, async (req, res) => {
  const { email, password, name } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "A valid email address is required." });
  }

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters long." });
  }

  try {
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    // Check password strength
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one uppercase letter, one lowercase letter, and one number." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user = await User.create({ email: email.toLowerCase().trim(), password: hashedPassword, name: name.trim() });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    res.status(201).json({ user: { id: user._id, email: user.email, name: user.name }, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// Google OAuth Endpoint
app.post("/oauth/google", authLimiter, async (req, res) => {
  console.log("Google OAuth endpoint hit with data:", req.body);

  const { token, action } = req.body;
  const isSignIn = action === 'signin';
  const isSignUp = action === 'signup';

  console.log(`Google ${isSignIn ? 'sign in' : 'sign up'} attempt`);

  if (!token) {
    console.error("No token provided in request");
    return res.status(400).json({ message: "Google token is required." });
  }

  try {
    console.log("Verifying Google token");

    // Verify the Google token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError);
      return res.status(401).json({ 
        message: "Google token verification failed.", 
        details: verifyError.message 
      });
    }

    const payload = ticket.getPayload();
    
    if (!payload) {
      console.error("No payload received from Google token verification");
      return res.status(400).json({ message: "Invalid Google token - no payload." });
    }
    
    if (!payload.email) {
      console.error("No email in payload:", payload);
      return res.status(400).json({ message: "Google token missing email information." });
    }

    console.log("Token verified successfully for:", payload.email);
    
    const { email, name, sub: googleId, picture } = payload;
    
    // Find user by email
    let user = await User.findOne({ email });

    // Handle sign-in vs sign-up logic
    if (!user) {
      // No existing user found
      if (isSignIn) {
        // If sign-in attempt but no account exists
        console.log(`Sign in failed: No account found for email ${email}`);
        return res.status(404).json({ 
          message: "No account found with this email. Please sign up first." 
        });
      }
      
      // For sign-up, create a new user
      console.log(`Creating new user account for: ${email}`);
      try {
        user = await User.create({
          email,
          googleId,
          name: name || email.split('@')[0],
          profileImage: picture || '',
          lastLogin: new Date(),
        });
        console.log(`New user created with ID: ${user._id}`);
      } catch (createError) {
        console.error("Error creating new user:", createError);
        return res.status(500).json({ 
          message: "Error creating user account.", 
          details: createError.message 
        });
      }
    } else {
      // User exists
      if (isSignUp) {
        console.log(`Account already exists for email: ${email}`);
        // We'll continue anyway since we're just logging them in
      }
      
      console.log(`Updating existing user: ${email} (ID: ${user._id})`);
      user.lastLogin = new Date();
      
      if (!user.googleId) {
        user.googleId = googleId;
      }
      
      if (!user.name && name) user.name = name;
      if (!user.profileImage && picture) user.profileImage = picture;
      
      await user.save();
    }

    // Generate JWT for authentication
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRATION }
    );

    console.log(`Google ${isSignIn ? 'sign in' : 'sign up'} successful for: ${email}`);
    
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        profileImage: user.profileImage || null
      }, 
      token: jwtToken,
      authProvider: "google",
      isNewUser: !user.createdAt || (Date.now() - user.createdAt.getTime() < 60000)
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ 
      message: `Google ${isSignIn ? 'sign in' : 'sign up'} failed. Please try again.`,
      details: error.message
    });
  }
});

// Contact Form Endpoint
app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const newContact = new Contact({ name, email, phone, subject, message });
    const validationError = newContact.validateSync();
    if (validationError) {
      return res.status(400).json({ error: "Validation failed", details: validationError.message });
    }
    const savedContact = await newContact.save();
    res.status(201).json({ message: "Contact saved successfully", id: savedContact._id });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ error: "Failed to save contact", details: error.message });
  }
});

// Get User Profile
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update User Profile
app.put("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, preferences, profileImage } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (preferences) user.preferences = preferences;
    if (profileImage) user.profileImage = profileImage;

    user.lastUpdated = new Date();
    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Password Change Endpoint
app.put("/api/user/password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google for authentication" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.lastUpdated = new Date();

    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Account Deletion Endpoint
app.delete("/api/user/account", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.deleteOne({ _id: user._id });
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// User Data Export Endpoint
app.get("/api/user/export", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const userData = {
      profile: user.toObject(),
      exportDate: new Date(),
      exportedBy: req.user.id,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=user_data_${new Date().toISOString().split("T")[0]}.json`
    );

    res.json(userData);
  } catch (error) {
    console.error("Error exporting user data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mvarunmathi2004@gmail.com', // Your Gmail address
    pass: 'ahiw jlsz dzxaohso' // Your Gmail app password
  }
});

// Helper function to send email notifications
const sendOrderNotification = async (to, subject, text) => {
  const mailOptions = {
    from: 'mvarunmathi2004@gmail.com', // Sender email
    to, // Recipient email
    subject, // Email subject
    text // Email body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order notification email sent:', info.response);
  } catch (error) {
    console.error('Error sending order notification email:', error.message);
  }
};

// Create New Order Endpoint
app.post("/api/orders", async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderItems,
      shippingInfo,
      deliveryMethod,
      paymentMethod,
      paymentResult,
      subtotal,
      deliveryPrice,
      totalPrice,
      orderReference,
      notes,
    } = req.body;

    if (
      !userEmail ||
      !orderItems ||
      !shippingInfo ||
      !shippingInfo.phone || // Ensure phone is provided
      !deliveryMethod ||
      !paymentMethod ||
      subtotal === undefined || subtotal === null ||
      totalPrice === undefined || totalPrice === null
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const finalOrderReference =
      orderReference || `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    let validatedUserId = null;
    let userFound = false;

    if (userId) {
      try {
        const userExists = await User.findById(userId);
        if (userExists) {
          validatedUserId = userId;
          userFound = true;
        }
      } catch (error) {
        console.warn(`Error validating userId: ${error.message}`);
      }
    }

    if (!userFound && userEmail) {
      try {
        const userByEmail = await User.findOne({ email: userEmail });
        if (userByEmail) {
          validatedUserId = userByEmail._id;
          userFound = true;
        }
      } catch (error) {
        console.warn(`Error finding user by email: ${error.message}`);
      }
    }

    const processedOrderItems = [];

    for (const item of orderItems) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: "Each order item must include a productId",
        });
      }

      const isNumericId = !isNaN(parseInt(item.productId));
      let product;

      if (isNumericId) {
        product = await Product.findOne({ id: parseInt(item.productId) });
      } else if (mongoose.Types.ObjectId.isValid(item.productId)) {
        product = await Product.findById(item.productId);
      } else {
        // Escape special regex characters to prevent ReDoS
        const escapedName = item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        product = await Product.findOne({ name: new RegExp(`^${escapedName}$`, "i") });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} (ID: ${item.productId}) not found`,
        });
      }

      // Atomic stock decrement to prevent race conditions (overselling)
      const quantity = parseInt(item.quantity);
      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product: ${product.name}`,
        });
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`,
        });
      }

      processedOrderItems.push({
        productId: isNumericId ? product.id.toString() : product._id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
      });
    }

    const newOrder = new Order({
      user: validatedUserId,
      userEmail,
      userName: userName || (validatedUserId ? "Registered User" : "Guest User"),
      orderItems: processedOrderItems,
      shippingInfo: {
        ...shippingInfo,
        phone: shippingInfo.phone, // Store phone number
      },
      deliveryMethod,
      paymentMethod,
      subtotal,
      deliveryPrice: deliveryPrice || 0,
      totalPrice,
      orderReference: finalOrderReference,
      notes: notes ? [notes] : [],
      orderStatus: "processing",
    });

    if (paymentResult) {
      newOrder.paymentResult = {
        id: paymentResult.id || "",
        status: paymentResult.status || "pending",
        update_time: paymentResult.update_time || new Date().toISOString(),
        email_address: paymentResult.email_address || userEmail,
      };

      if (paymentResult.status === "success") {
        newOrder.paymentStatus = "completed";
      } else if (paymentResult.status === "failed") {
        newOrder.paymentStatus = "failed";
      } else {
        newOrder.paymentStatus = "pending";
      }
    } else {
      newOrder.paymentStatus = paymentMethod === "cod" ? "pending" : "failed";
    }

    const savedOrder = await newOrder.save();

    if (validatedUserId) {
      await User.findByIdAndUpdate(
        validatedUserId,
        {
          $push: { orderHistory: savedOrder._id },
          lastUpdated: new Date(),
        },
        { new: true }
      );
    }

    // Send email notification to the user
    const emailSubject = `Order Confirmation - ${savedOrder.orderReference}`;
    const emailBody = `Hello ${savedOrder.userName},\n\nThank you for your order!\n\nOrder Reference: ${savedOrder.orderReference}\nTotal Price: ₹${savedOrder.totalPrice.toFixed(2)}\n\nWe will notify you once your order is shipped.\n\nThank you for shopping with us!`;
    sendOrderNotification(savedOrder.userEmail, emailSubject, emailBody);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
      orderReference: savedOrder.orderReference,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing order",
      error: error.message,
    });
  }
});

// Get User's Orders
app.get("/api/my-orders", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.orderHistory && user.orderHistory.length > 0) {
      const populatedUser = await User.findById(req.user.id)
        .select("orderHistory")
        .populate({
          path: "orderHistory",
          options: { sort: { createdAt: -1 } },
        });

      return res.json({
        success: true,
        orders: populatedUser.orderHistory,
        message: "Orders retrieved from order history",
      });
    }

    const userOrders = await Order.find({
      $or: [{ user: req.user.id }, { userEmail: user.email }],
    }).sort({ createdAt: -1 });

    if (userOrders.length > 0) {
      try {
        const orderIds = userOrders.map((order) => order._id);
        await User.findByIdAndUpdate(req.user.id, {
          orderHistory: orderIds,
          lastUpdated: new Date(),
        });
      } catch (updateError) {
        console.error("Failed to update orderHistory:", updateError);
      }
    }

    if (userOrders.length === 0) {
      return res.status(200).json({
        success: true,
        orders: [],
        message: "No orders found for this user",
      });
    }

    return res.json({
      success: true,
      orders: userOrders,
      message: "Orders retrieved by ID and email lookup",
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders. Please try again later.",
      error: error.message,
    });
  }
});

// Get User's Wishlist
app.get("/api/user/wishlist", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add Item to Wishlist
app.post("/api/user/wishlist", authenticateToken, async (req, res) => {
  try {
    const { productId, name, price, image, description, category } = req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({ message: "Missing required product information" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingItem = user.wishlist.find((item) => item.productId === productId);
    if (existingItem) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    user.wishlist.push({
      productId,
      name,
      price,
      image,
      description,
      category,
      addedAt: new Date(),
    });

    user.lastUpdated = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: "Item added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove Item from Wishlist
app.delete("/api/user/wishlist/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter((item) => item.productId !== productId);

    if (user.wishlist.length === initialLength) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    user.lastUpdated = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Item removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Clear Entire Wishlist
app.delete("/api/user/wishlist", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = [];
    user.lastUpdated = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================================
// PUBLIC API ENDPOINTS
// ===========================================

// GET all products for public access
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Handle 404 routes (must be after all other routes)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler - catches unhandled errors in routes (must be last middleware)
app.use((err, req, res, next) => {
  // Handle multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum size is 5MB.' });
  }
  // Handle multer file type errors
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: err.message });
  }
  // Handle CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: 'Not allowed by CORS' });
  }
  // Handle JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
