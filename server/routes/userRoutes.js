import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/auth.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateRegistration, validateLogin } from "../middleware/validation.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { username, email, password, role = 'resident', profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Create new user (password will be hashed by pre-save middleware)
    const userData = {
      username,
      email,
      password,
      role,
      profile: profile || {}
    };

    const newUser = await User.create(userData);

    // Generate JWT token
    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role
    });

    // Return user data without password
    const userResponse = newUser.toJSON();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      token
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password using the model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // Return user data without password
    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post("/logout", authenticate, async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token. We can log the logout event here.
    
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout"
    });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticate, async (req, res) => {
  try {
    // User is already attached to req by authenticate middleware
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: user.toJSON()
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile"
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { profile } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update profile fields
    if (profile) {
      user.profile = { ...user.profile, ...profile };
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON()
    });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile"
    });
  }
});

export default router;
