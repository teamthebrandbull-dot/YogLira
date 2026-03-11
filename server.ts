import express from "express";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import db from "./server/db.ts";
import { generateYogaRoutine } from "./src/services/geminiService.ts";

// ICICI Bank Mock Integration
// In a real scenario, you would use ICICI's specific API documentation for S2S or Hosted Payment Page
const ICICI_MERCHANT_ID = process.env.ICICI_MERCHANT_ID || "ICICI_MOCK_MID";
const ICICI_KEY = process.env.ICICI_KEY || "ICICI_MOCK_KEY";
const JWT_SECRET = process.env.JWT_SECRET || "yoglira_secret_key";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(morgan("dev"));
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // ICICI Webhook/Callback
  app.post("/api/webhooks/icici", express.json(), async (req, res) => {
    const { transactionId, status, userId, amount } = req.body;
    
    // Verify checksum/signature here in production
    
    if (status === "SUCCESS") {
      db.prepare(`
        UPDATE users SET subscription_status = 'active' WHERE id = ?
      `).run(userId);

      db.prepare(`
        INSERT INTO subscriptions (user_id, stripe_subscription_id, status, trial_end)
        VALUES (?, ?, 'active', ?)
      `).run(userId, `ICICI_${transactionId}`, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

      // Handle Referral Reward
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (user && user.referred_by) {
        const referrer = db.prepare("SELECT * FROM users WHERE referral_code = ?").get(user.referred_by) as any;
        if (referrer) {
          db.prepare("UPDATE wallet SET balance = balance + 3 WHERE user_id = ?").run(referrer.id);
          db.prepare(`
            INSERT INTO wallet_transactions (user_id, type, amount, description)
            VALUES (?, 'credit', 3, ?)
          `).run(referrer.id, `Referral bonus for ${user.name}`);
        }
      }
    }

    res.json({ received: true });
  });

  // Create default admin if not exists
  const adminEmail = "admin@yoglira.com";
  const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminReferral = "ADMIN001";
    db.prepare(`
      INSERT INTO users (name, email, password, referral_code, role, subscription_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("Admin User", adminEmail, adminPassword, adminReferral, "admin", "active");
    
    const adminId = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail) as any;
    db.prepare("INSERT INTO wallet (user_id, balance) VALUES (?, 0)").run(adminId.id);
    console.log("Default admin user created: admin@yoglira.com / admin123");
  }

  // Seed sample courses
  const existingCourses = db.prepare("SELECT COUNT(*) as count FROM courses").get() as any;
  if (existingCourses.count === 0) {
    const sampleCourses = [
      { title: "Morning Flow", description: "A gentle 15-minute morning yoga flow to wake up your body.", video_url: "https://www.youtube.com/embed/v7AYKMP6rOE", price: 0, is_premium: 0 },
      { title: "Power Vinyasa", description: "Advanced power vinyasa for strength and flexibility.", video_url: "https://www.youtube.com/embed/9kOCY0KNByw", price: 19.99, is_premium: 1 },
      { title: "Stress Relief Yoga", description: "Deep relaxation and breathing techniques for stress management.", video_url: "https://www.youtube.com/embed/sTANio_2E0Q", price: 9.99, is_premium: 1 }
    ];
    for (const course of sampleCourses) {
      const result = db.prepare("INSERT INTO courses (title, description, video_url, price, is_premium) VALUES (?, ?, ?, ?, ?)")
        .run(course.title, course.description, course.video_url, course.price, course.is_premium);
      
      // Add a default lesson for each course
      db.prepare("INSERT INTO lessons (course_id, title, video_url, order_index) VALUES (?, ?, ?, ?)")
        .run(result.lastInsertRowid, "Introduction", course.video_url, 0);
    }
    console.log("Sample courses seeded.");
  }

  // Seed default settings
  const settings = [
    { key: 'icici_merchant_id', value: 'ICICI_MOCK_MID' },
    { key: 'icici_key', value: 'ICICI_MOCK_KEY' },
    { key: 'stripe_publishable_key', value: '' },
    { key: 'stripe_secret_key', value: '' },
    { key: 'payment_gateway', value: 'icici' }
  ];
  for (const s of settings) {
    const exists = db.prepare("SELECT 1 FROM app_settings WHERE key = ?").get(s.key);
    if (!exists) {
      db.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?)").run(s.key, s.value);
    }
  }

  // Seed test users requested by user
  const testUsers = [
    { email: "yoglirapp@gmail.com", name: "Yog Lira User" },
    { email: "yoglirapp6@gmail.com", name: "Yog Lira 6" },
    { email: "yoglirapp4@gmail.com", name: "Yog Lira 4" }
  ];

  for (const testUser of testUsers) {
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(testUser.email);
    if (!existing) {
      const password = await bcrypt.hash("password123", 10);
      const referral = "TEST" + Math.random().toString(36).substring(2, 6).toUpperCase();
      const result = db.prepare(`
        INSERT INTO users (name, email, password, referral_code, role, subscription_status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(testUser.name, testUser.email, password, referral, "user", "active");
      
      db.prepare("INSERT INTO wallet (user_id, balance) VALUES (?, 100)").run(result.lastInsertRowid);
      db.prepare(`
        INSERT INTO wallet_transactions (user_id, type, amount, description)
        VALUES (?, 'credit', 100, ?)
      `).run(result.lastInsertRowid, "Welcome Bonus");
      console.log(`Test user created: ${testUser.email} / password123`);
    }
  }

  app.use(express.json());
  app.use(cors());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      console.log(`Authenticated user: ${req.user.email}`);
      next();
    } catch (e) {
      console.log("Invalid token");
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // --- API Routes ---

  // Register
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, referralCode, age, country, address, mobile } = req.body;
    console.log(`Registration attempt: ${email}`);
    
    // Validate referral code if provided
    if (referralCode) {
      const referrer = db.prepare("SELECT id FROM users WHERE referral_code = ?").get(referralCode);
      if (!referrer) {
        return res.status(400).json({ error: "Invalid referral code" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const result = db.prepare(`
        INSERT INTO users (name, email, password, referral_code, referred_by, subscription_status, age, country, address, mobile)
        VALUES (?, ?, ?, ?, ?, 'pending_payment', ?, ?, ?, ?)
      `).run(name, email, hashedPassword, myReferralCode, referralCode || null, age || null, country || null, address || null, mobile || null);

      const userId = result.lastInsertRowid;
      console.log(`User registered successfully: ${email}, ID: ${userId}`);
      
      // Initialize wallet
      db.prepare("INSERT INTO wallet (user_id, balance) VALUES (?, 0)").run(userId);

      // Add sample notifications
      db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)")
        .run(userId, "Welcome to YogLira!", "Start your journey with our AI-powered yoga routines.", "info");
      db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)")
        .run(userId, "Referral Bonus", "Share your code to earn rewards for every friend who joins.", "success");

      const token = jwt.sign({ id: userId, email, role: 'user' }, JWT_SECRET);
      res.json({ 
        token, 
        user: { 
          id: userId, 
          name, 
          email, 
          referralCode: myReferralCode, 
          subscriptionStatus: 'pending_payment',
          age,
          country,
          address,
          mobile,
          profilePicture: null,
          twoFactorEnabled: false,
          preferences: JSON.parse(DEFAULT_PREFERENCES)
        } 
      });
    } catch (e: any) {
      console.error(`Registration error for ${email}:`, e.message);
      res.status(400).json({ error: "Email already exists" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt: ${email}`);
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    if (!user) {
      console.log(`Login failed: User ${email} not found`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`Login successful: ${email}`);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        referralCode: user.referral_code, 
        subscriptionStatus: user.subscription_status, 
        role: user.role,
        age: user.age,
        country: user.country,
        address: user.address,
        mobile: user.mobile,
        profilePicture: user.profile_picture,
        twoFactorEnabled: !!user.two_factor_enabled,
        preferences: JSON.parse(user.preferences || DEFAULT_PREFERENCES)
      } 
    });
  });

  // Forgot Password
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    console.log(`Forgot password request for: ${email}`);
    
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      // Don't reveal if user exists or not for security, but for this demo we'll be helpful
      return res.status(404).json({ error: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    db.prepare("DELETE FROM password_resets WHERE email = ?").run(email);
    db.prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)")
      .run(email, token, expiresAt);

    // In a real app, send email here. For now, log the link.
    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log(`--- PASSWORD RESET EMAIL SIMULATION ---`);
    console.log(`To: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`---------------------------------------`);

    res.json({ success: true, message: "Password reset link sent to your email." });
  });

  // Reset Password
  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, password } = req.body;
    console.log(`Reset password attempt with token: ${token}`);

    const resetRequest = db.prepare("SELECT * FROM password_resets WHERE token = ?").get(token) as any;
    
    if (!resetRequest) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (new Date(resetRequest.expires_at) < new Date()) {
      db.prepare("DELETE FROM password_resets WHERE token = ?").run(token);
      return res.status(400).json({ error: "Token has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.prepare("UPDATE users SET password = ? WHERE email = ?").run(hashedPassword, resetRequest.email);
    db.prepare("DELETE FROM password_resets WHERE email = ?").run(resetRequest.email);

    console.log(`Password reset successful for: ${resetRequest.email}`);
    res.json({ success: true, message: "Password has been reset successfully." });
  });

  // ICICI Payment Initiation
  app.post("/api/billing/icici/setup", authenticate, async (req: any, res) => {
    const { cardNumber, expiry, cvv, planId } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id) as any;

    if (!planId) return res.status(400).json({ error: "Plan ID is required" });

    try {
      // Mock ICICI Autopay Setup Logic
      const transactionId = "TXN_" + Math.random().toString(36).substring(7).toUpperCase();
      
      // Calculate trial end (7 days from now)
      const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      // Calculate next billing date (trial end + plan duration)
      const nextBillingDate = new Date(trialEnd);
      if (planId === 'annual') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      } else {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      }

      // Simulate successful autopay attachment
      db.prepare("UPDATE users SET subscription_status = 'active' WHERE id = ?").run(user.id);
      
      db.prepare(`
        INSERT INTO subscriptions (user_id, stripe_subscription_id, plan_id, status, trial_end, next_billing_date)
        VALUES (?, ?, ?, 'active', ?, ?)
      `).run(user.id, `ICICI_${transactionId}`, planId, trialEnd.toISOString(), nextBillingDate.toISOString());

      // Handle Referral Reward
      if (user.referred_by) {
        const referrer = db.prepare("SELECT * FROM users WHERE referral_code = ?").get(user.referred_by) as any;
        if (referrer) {
          db.prepare("UPDATE wallet SET balance = balance + 3 WHERE user_id = ?").run(referrer.id);
          db.prepare(`
            INSERT INTO wallet_transactions (user_id, type, amount, description)
            VALUES (?, 'credit', 3, ?)
          `).run(referrer.id, `Referral bonus for ${user.name}`);
        }
      }

      res.json({ success: true, transactionId });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

const DEFAULT_PREFERENCES = JSON.stringify({
  publicProfile: true,
  shareActivity: true,
  dataAnalytics: true,
  dailyReminders: true,
  challengeUpdates: true,
  newCourses: true,
  promotions: true,
  aiPersonality: 'Encouraging & Warm',
  aiFocusAreas: ['Flexibility', 'Stress Relief']
});

  // Get Current User
  app.get("/api/auth/me", authenticate, (req: any, res) => {
    console.log(`Fetching user for ID: ${req.user.id}`);
    const user = db.prepare("SELECT id, name, email, referral_code, subscription_status, role, age, country, address, mobile, two_factor_enabled, preferences, profile_picture FROM users WHERE id = ?").get(req.user.id) as any;
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }
    console.log(`User found: ${user.email}`);
    res.json({ 
      user: { 
        ...user, 
        referralCode: user.referral_code, 
        subscriptionStatus: user.subscription_status,
        profilePicture: user.profile_picture,
        twoFactorEnabled: !!user.two_factor_enabled,
        preferences: JSON.parse(user.preferences || DEFAULT_PREFERENCES)
      } 
    });
  });

  // Update Profile
  app.post("/api/auth/update-profile", authenticate, (req: any, res) => {
    const { name, email, age, country, address, mobile, profile_picture } = req.body;
    try {
      db.prepare(`
        UPDATE users 
        SET name = ?, email = ?, age = ?, country = ?, address = ?, mobile = ?, profile_picture = ?
        WHERE id = ?
      `).run(name, email, age, country, address, mobile, profile_picture, req.user.id);
      
      const user = db.prepare("SELECT id, name, email, referral_code, subscription_status, role, age, country, address, mobile, two_factor_enabled, preferences, profile_picture FROM users WHERE id = ?").get(req.user.id) as any;
      res.json({ 
        success: true, 
        user: { 
          ...user, 
          referralCode: user.referral_code, 
          subscriptionStatus: user.subscription_status,
          twoFactorEnabled: !!user.two_factor_enabled,
          preferences: JSON.parse(user.preferences || DEFAULT_PREFERENCES)
        } 
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Update Password
  app.post("/api/auth/update-password", authenticate, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
      const user = db.prepare("SELECT password FROM users WHERE id = ?").get(req.user.id) as any;
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, req.user.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Toggle 2FA
  app.post("/api/auth/toggle-2fa", authenticate, (req: any, res) => {
    const { enabled } = req.body;
    try {
      db.prepare("UPDATE users SET two_factor_enabled = ? WHERE id = ?").run(enabled ? 1 : 0, req.user.id);
      res.json({ success: true, twoFactorEnabled: enabled });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Update Preferences
  app.post("/api/auth/update-preferences", authenticate, (req: any, res) => {
    const { preferences } = req.body;
    try {
      db.prepare("UPDATE users SET preferences = ? WHERE id = ?").run(JSON.stringify(preferences), req.user.id);
      res.json({ success: true, preferences });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Notifications
  app.get("/api/notifications", authenticate, (req: any, res) => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    res.json(notifications);
  });

  app.post("/api/notifications/mark-read", authenticate, (req: any, res) => {
    const { id } = req.body;
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(id, req.user.id);
    res.json({ success: true });
  });

  app.post("/api/notifications/mark-all-read", authenticate, (req: any, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(req.user.id);
    res.json({ success: true });
  });

  // AI Routine Generator
  app.post("/api/ai/generate-routine", authenticate, async (req: any, res) => {
    const { level, goals } = req.body;
    const routine = await generateYogaRoutine(level, goals);
    res.json(routine);
  });

  // Wallet Info
  app.get("/api/wallet", authenticate, (req: any, res) => {
    const wallet = db.prepare("SELECT * FROM wallet WHERE user_id = ?").get(req.user.id);
    const transactions = db.prepare("SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    res.json({ wallet, transactions });
  });

  // Withdrawal Request
  app.post("/api/wallet/withdraw", authenticate, (req: any, res) => {
    const { amount } = req.body;
    const wallet = db.prepare("SELECT balance FROM wallet WHERE user_id = ?").get(req.user.id) as any;
    
    if (amount < 50) return res.status(400).json({ error: "Minimum withdrawal is $50" });
    if (wallet.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

    db.prepare("INSERT INTO withdrawal_requests (user_id, amount) VALUES (?, ?)").run(req.user.id, amount);
    db.prepare("UPDATE wallet SET balance = balance - ? WHERE user_id = ?").run(amount, req.user.id);
    db.prepare("INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, 'debit', ?, 'Withdrawal request')")
      .run(req.user.id, amount);

    res.json({ success: true });
  });

  // Subscription Info
  app.get("/api/subscription", authenticate, (req: any, res) => {
    const sub = db.prepare("SELECT * FROM subscriptions WHERE user_id = ?").get(req.user.id) as any;
    if (!sub) return res.json({ subscription: null });
    
    // Mock amount based on plan_id for now
    const amount = sub.plan_id === 'premium_monthly' ? 9.99 : 19.00;
    res.json({ subscription: { ...sub, amount } });
  });

  app.post("/api/subscription/cancel", authenticate, (req: any, res) => {
    db.prepare("UPDATE subscriptions SET status = 'canceled' WHERE user_id = ?").run(req.user.id);
    db.prepare("UPDATE users SET subscription_status = 'inactive' WHERE id = ?").run(req.user.id);
    
    // Add notification
    db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)")
      .run(req.user.id, "Subscription Canceled", "Your subscription has been canceled. You will still have access until the end of your billing period.", "warning");
      
    res.json({ success: true });
  });

  // Admin: Stats
  app.get("/api/admin/stats", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const activeSubs = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'").get() as any;
    const trialUsers = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'trialing'").get() as any;
    const totalPayouts = db.prepare("SELECT SUM(amount) as total FROM withdrawal_requests WHERE status = 'approved'").get() as any;
    const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM wallet_transactions WHERE type = 'debit' AND description LIKE '%Subscription%'").get() as any;
    const pendingWithdrawals = db.prepare("SELECT COUNT(*) as count FROM withdrawal_requests WHERE status = 'pending'").get() as any;

    res.json({
      totalUsers: totalUsers.count,
      activeSubscriptions: activeSubs.count,
      trialUsers: trialUsers.count,
      totalPayouts: totalPayouts.total || 0,
      totalRevenue: totalRevenue.total || 0,
      pendingWithdrawals: pendingWithdrawals.count
    });
  });

  // Admin: User Management
  app.get("/api/admin/users", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const users = db.prepare(`
      SELECT u.*, w.balance 
      FROM users u 
      LEFT JOIN wallet w ON u.id = w.user_id 
      ORDER BY u.created_at DESC
    `).all();
    res.json(users);
  });

  app.put("/api/admin/users/:id", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const { name, email, role, subscription_status } = req.body;
    db.prepare("UPDATE users SET name = ?, email = ?, role = ?, subscription_status = ? WHERE id = ?")
      .run(name, email, role, subscription_status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/users/:id", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin: Course Management
  app.get("/api/admin/courses", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const courses = db.prepare("SELECT * FROM courses ORDER BY created_at DESC").all() as any[];
    const coursesWithLessons = courses.map(course => {
      const lessons = db.prepare("SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC").all(course.id);
      return { ...course, lessons };
    });
    res.json(coursesWithLessons);
  });

  // Admin: Lesson Management
  app.post("/api/admin/lessons", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const { course_id, title, description, video_url, duration, order_index } = req.body;
    db.prepare("INSERT INTO lessons (course_id, title, description, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?, ?)")
      .run(course_id, title, description, video_url, duration, order_index || 0);
    res.json({ success: true });
  });

  app.put("/api/admin/lessons/:id", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const { title, description, video_url, duration, order_index } = req.body;
    db.prepare("UPDATE lessons SET title = ?, description = ?, video_url = ?, duration = ?, order_index = ? WHERE id = ?")
      .run(title, description, video_url, duration, order_index, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/lessons/:id", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    db.prepare("DELETE FROM lessons WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin: App Settings
  app.get("/api/admin/settings", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const settings = db.prepare("SELECT * FROM app_settings").all();
    const settingsMap = (settings as any[]).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsMap);
  });

  app.post("/api/admin/settings", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const settings = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        stmt.run(key, value);
      }
    });
    transaction(settings);
    res.json({ success: true });
  });

  app.post("/api/admin/courses", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const { title, description, video_url, price, is_premium } = req.body;
    db.prepare("INSERT INTO courses (title, description, video_url, price, is_premium) VALUES (?, ?, ?, ?, ?)")
      .run(title, description, video_url, price, is_premium ? 1 : 0);
    res.json({ success: true });
  });

  app.put("/api/admin/courses/:id", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const { title, description, video_url, price, is_premium } = req.body;
    db.prepare("UPDATE courses SET title = ?, description = ?, video_url = ?, price = ?, is_premium = ? WHERE id = ?")
      .run(title, description, video_url, price, is_premium ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/courses/:id", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    db.prepare("DELETE FROM courses WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin: Wallet & Withdrawals
  app.get("/api/admin/withdrawals", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const withdrawals = db.prepare(`
      SELECT w.*, u.name as user_name, u.email as user_email 
      FROM withdrawal_requests w 
      JOIN users u ON w.user_id = u.id 
      ORDER BY w.created_at DESC
    `).all();
    res.json(withdrawals);
  });

  app.post("/api/admin/withdrawals/:id/approve", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    db.prepare("UPDATE withdrawal_requests SET status = 'approved' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/withdrawals/:id/reject", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const withdrawal = db.prepare("SELECT * FROM withdrawal_requests WHERE id = ?").get(req.params.id) as any;
    if (withdrawal.status === 'pending') {
      db.prepare("UPDATE withdrawal_requests SET status = 'rejected' WHERE id = ?").run(req.params.id);
      db.prepare("UPDATE wallet SET balance = balance + ? WHERE user_id = ?").run(withdrawal.amount, withdrawal.user_id);
      db.prepare("INSERT INTO wallet_transactions (user_id, type, amount, description) VALUES (?, 'credit', ?, 'Withdrawal rejected')")
        .run(withdrawal.user_id, withdrawal.amount);
    }
    res.json({ success: true });
  });

  // Admin: Subscriptions
  app.get("/api/admin/subscriptions", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const subscriptions = db.prepare(`
      SELECT s.*, u.name as user_name, u.email as user_email 
      FROM subscriptions s 
      JOIN users u ON s.user_id = u.id 
      ORDER BY s.next_billing_date ASC
    `).all();
    res.json(subscriptions);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware attached.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
