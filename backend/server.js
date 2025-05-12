const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const PORT = 5008;
const JWT_SECRET = "4953546c308be3088b28807c767bd35e99818434d130a588e5e6d90b6d1d326e";
const GOOGLE_CLIENT_ID = "435475456119-dsajbk8ujprqvig0nua0g9qfmmks5v2j.apps.googleusercontent.com";
const MONGO_URI = "mongodb+srv://varun:454697@ksp.gqt0t.mongodb.net/M_v?retryWrites=true&w=majority";

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Initialize Google OAuth client outside any route
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// MongoDB Connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
  notes: { type: String },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  image: { type: String },
  id: { type: Number, required: true, unique: true },
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

// Login Endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    console.log(`Login attempt for email: ${email}`);
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`Login failed: User not found with email ${email}`);
      return res.status(400).json({ message: "User not found. Please sign up." });
    }

    if (user.googleId && !user.password) {
      console.log(`Login failed: Google account without password for ${email}`);
      return res.status(400).json({ message: "This account uses Google login. Please use Google to sign in." });
    }

    if (!user.password) {
      console.log(`Login failed: No password set for ${email}`);
      return res.status(400).json({ message: "No password set for this account." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: Invalid password for ${email}`);
      return res.status(400).json({ message: "Invalid credentials." });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    console.log(`Login successful for ${email}`);
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
    res.status(500).json({ message: "Server error during login.", details: error.message });
  }
});

// Signup Endpoint
app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ email, password: hashedPassword, name });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({ user: { id: user._id, email: user.email, name: user.name }, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// Google OAuth Endpoint
app.post("/oauth/google", async (req, res) => {
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
      { expiresIn: "1h" }
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
app.post("/api/contact", async (req, res) => {
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

// Test DB Endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const connectionState = {
      readyState: mongoose.connection.readyState,
      status: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
    };
    res.status(200).json({ message: "DB connection test", connection: connectionState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Contacts
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contacts", details: error.message });
  }
});

// Get All Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "email name createdAt");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
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

// Authentication Status Endpoint
app.get("/api/auth/status", authenticateToken, (req, res) => {
  res.json({
    authenticated: true,
    userId: req.user.id,
    email: req.user.email,
    lastVerified: new Date(),
  });
});

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
      !deliveryMethod ||
      !paymentMethod ||
      !subtotal ||
      !totalPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        details: "Please provide all necessary order information",
      });
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
        product = await Product.findOne({ name: new RegExp(`^${item.name}$`, "i") });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} (ID: ${item.productId}) not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`,
        });
      }

      product.stock -= item.quantity;
      await product.save();

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
      shippingInfo,
      deliveryMethod,
      paymentMethod,
      subtotal,
      deliveryPrice: deliveryPrice || 0,
      totalPrice,
      orderReference: finalOrderReference,
      notes: notes || "",
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

// Get Order by ID
app.get("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this order" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

// Get All Orders (Admin)
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders. Please try again later." });
  }
});

// Get All Orders (Admin - No Authentication)
app.get("/api/orders/admin/all", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
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

// Update Order Status Endpoint for Admin (No Authentication)
app.put("/api/orders/admin/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    if (status === "delivered" && order.paymentMethod === "cod" && order.paymentStatus === "pending") {
      order.paymentStatus = "completed";
    }

    if (status === "cancelled") {
      if (order.paymentStatus === "completed") {
        console.log(`Admin cancelled order ${id} with completed payment - refund may be needed`);
      } else if (order.paymentStatus === "pending") {
        order.paymentStatus = "failed";
      }
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating order status (admin):", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
});

// Update Order Status Endpoint
app.put("/api/orders/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    if (status === "delivered" && order.paymentMethod === "cod" && order.paymentStatus === "pending") {
      order.paymentStatus = "completed";
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
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

// Start Server
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));