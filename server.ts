import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  DbUser, DbDriver, DbChat, DbMessage, DbOrder, DbPayment, OrderStatus 
} from "./src/types";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "nitip_dong_db.json");

// Middleware
app.use(express.json({ limit: "20mb" }));

// Helper to write database
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// Helper to read database or auto-seed with rich Kemayoran data
function readDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    } catch {
      // If corrupted, initialize fresh
    }
  }

  // Seed data
  const initialUsers: DbUser[] = [
    {
      id: "cust-1",
      role: "customer",
      name: "Anggi Prastyan (You)",
      phone: "08123456789",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      rating: 5.0
    },
    {
      id: "driver-1",
      role: "driver",
      name: "Budi Santoso (Driver)",
      phone: "08111222333",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      rating: 4.8
    },
    {
      id: "driver-2",
      role: "driver",
      name: "Yusuf Kuncoro (Driver)",
      phone: "08222333444",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      rating: 4.9
    },
    {
      id: "driver-3",
      role: "driver",
      name: "Aris Wijaya (Driver)",
      phone: "08333444555",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
      rating: 4.7
    },
    {
      id: "admin-1",
      role: "admin",
      name: "Dewi Lestari (Admin)",
      phone: "08999999999",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      rating: 5.0
    }
  ];

  const initialDrivers: DbDriver[] = [
    {
      id: "dbdriver-1",
      user_id: "driver-1",
      online_status: "online",
      latitude: -6.151,
      longitude: 106.841,
      name: "Budi Santoso",
      phone: "08111222333",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      rating: 4.8,
      status: "free"
    },
    {
      id: "dbdriver-2",
      user_id: "driver-2",
      online_status: "online",
      latitude: -6.157,
      longitude: 106.848,
      name: "Yusuf Kuncoro",
      phone: "08222333444",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      rating: 4.9,
      status: "free"
    },
    {
      id: "dbdriver-3",
      user_id: "driver-3",
      online_status: "offline",
      latitude: -6.153,
      longitude: 106.852,
      name: "Aris Wijaya",
      phone: "08333444555",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
      rating: 4.7,
      status: "free"
    }
  ];

  /* Preseed a warm welcoming message */
  const initialChats: DbChat[] = [
    {
      id: "chat-1",
      customer_id: "cust-1",
      driver_id: "driver-1",
      customer_name: "Anggi Prastyan (You)",
      driver_name: "Budi Santoso",
      last_message_text: "Halo Mas Budi! Bisa nitip belikan Nasi Goreng Gila Kemayoran?",
      last_message_time: new Date().toISOString()
    }
  ];

  const initialMessages: DbMessage[] = [
    {
      id: "msg-1-1",
      chat_id: "chat-1",
      sender_id: "driver-1",
      message: "Halo! Selamat datang di Nitip Dong. Saya Budi, driver jastip Kemayoran Anda. Anda bisa nitip makanan/minuman apa saja dari kaki lima sampai minimarket!",
      image_url: null,
      created_at: new Date(Date.now() - 500000).toISOString(),
      is_read: true
    },
    {
      id: "msg-1-2",
      chat_id: "chat-1",
      sender_id: "cust-1",
      message: "Halo Mas Budi! Bisa nitip belikan Nasi Goreng Gila Kemayoran?",
      image_url: null,
      created_at: new Date(Date.now() - 400000).toISOString(),
      is_read: true
    }
  ];

  const seed = {
    users: initialUsers,
    drivers: initialDrivers,
    chats: initialChats,
    messages: initialMessages,
    orders: [],
    payments: []
  };

  writeDb(seed);
  return seed;
}

// Initialize
let db = readDb();

// ---------------- SERVER REST API ROUTES ----------------

// Get status / reset
app.post("/api/reset", (req, res) => {
  fs.unlinkSync(DB_FILE);
  db = readDb();
  res.json({ message: "Database reset to defaults", db });
});

// Get entire state (for syncing)
app.get("/api/state", (req, res) => {
  res.json(db);
});

// Users
app.post("/api/users/login", (req, res) => {
  const { phone, name, role } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number required" });
  }

  // Find user by phone
  let user = db.users.find((u: DbUser) => u.phone === phone);
  if (!user) {
    // Create automatic user
    user = {
      id: "user-" + Date.now(),
      role: role || "customer",
      name: name || "Customer " + phone.slice(-4),
      phone,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      rating: 5.0
    };
    db.users.push(user);

    // If role is driver, also add to drivers table
    if (user.role === "driver") {
      const driverObj: DbDriver = {
        id: "dbdriver-" + Date.now(),
        user_id: user.id,
        online_status: "online",
        latitude: -6.155 + (Math.random() - 0.5) * 0.02,
        longitude: 106.845 + (Math.random() - 0.5) * 0.02,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        rating: 5.0,
        status: "free"
      };
      db.drivers.push(driverObj);
    }
    writeDb(db);
  } else if (role && user.role !== role) {
    // update role for simulation purposes
    user.role = role;
    writeDb(db);
  }

  res.json(user);
});

// Create new user (Google Login mockup or quick login)
app.post("/api/users/google", (req, res) => {
  const { email, name, role } = req.body;
  const dummyPhone = "0812" + Math.floor(10000000 + Math.random() * 90000000);
  let user = db.users.find((u: DbUser) => u.name === name);
  if (!user) {
    user = {
      id: "user-g-" + Date.now(),
      role: role || "customer",
      name: name || "Google User",
      phone: dummyPhone,
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200`,
      rating: 5.0
    };
    db.users.push(user);
    writeDb(db);
  }
  res.json(user);
});

// Update Profile
app.put("/api/users/:id", (req, res) => {
  const { name, phone, avatar, role } = req.body;
  const user = db.users.find((u: DbUser) => u.id === req.params.id);
  if (user) {
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (role) user.role = role;
    writeDb(db);
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Drivers Online / Status
app.get("/api/drivers", (req, res) => {
  // Join with user details
  const joinedDrivers = db.drivers.map((drv: DbDriver) => {
    const usr = db.users.find((u: DbUser) => u.id === drv.user_id);
    return {
      ...drv,
      name: usr ? usr.name : drv.name,
      avatar: usr ? usr.avatar : drv.avatar,
      rating: usr ? usr.rating : drv.rating,
      phone: usr ? usr.phone : drv.phone
    };
  });
  res.json(joinedDrivers);
});

// Driver details Update / Online toggle
app.post("/api/drivers/status", (req, res) => {
  const { user_id, online_status, latitude, longitude, status } = req.body;
  let driver = db.drivers.find((d: DbDriver) => d.user_id === user_id);
  if (!driver) {
    // Create new driver record
    const user = db.users.find((u: DbUser) => u.id === user_id);
    driver = {
      id: "dbdriver-" + Date.now(),
      user_id,
      online_status: online_status || "online",
      latitude: latitude || -6.155,
      longitude: longitude || 106.845,
      name: user ? user.name : "Driver",
      phone: user ? user.phone : "081",
      avatar: user ? user.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      rating: user ? user.rating : 5.0,
      status: status || "free"
    };
    db.drivers.push(driver);
  } else {
    if (online_status) driver.online_status = online_status;
    if (latitude !== undefined) driver.latitude = latitude;
    if (longitude !== undefined) driver.longitude = longitude;
    if (status !== undefined) driver.status = status;
  }
  writeDb(db);
  res.json(driver);
});

// Chats
app.get("/api/chats", (req, res) => {
  const { user_id, role } = req.query;
  let filteredChats = db.chats;

  if (user_id) {
    if (role === "driver") {
      filteredChats = db.chats.filter((c: DbChat) => c.driver_id === user_id);
    } else if (role === "customer") {
      filteredChats = db.chats.filter((c: DbChat) => c.customer_id === user_id);
    } else {
      filteredChats = db.chats.filter((c: DbChat) => c.customer_id === user_id || c.driver_id === user_id);
    }
  }

  // Populate helper names
  const chatsWithNames = filteredChats.map((c: DbChat) => {
    const cust = db.users.find((u: DbUser) => u.id === c.customer_id);
    const drv = db.users.find((u: DbUser) => u.id === c.driver_id);
    const chatMsgs = db.messages.filter((m: DbMessage) => m.chat_id === c.id);
    const lastMsg = chatMsgs[chatMsgs.length - 1];

    return {
      ...c,
      customer_name: cust ? cust.name : "Customer",
      customer_avatar: cust ? cust.avatar : null,
      driver_name: drv ? drv.name : "Driver",
      driver_avatar: drv ? drv.avatar : null,
      last_message_text: lastMsg ? lastMsg.message : "Mulai obrolan...",
      last_message_time: lastMsg ? lastMsg.created_at : new Date().toISOString()
    };
  });

  res.json(chatsWithNames);
});

app.post("/api/chats/create", (req, res) => {
  const { customer_id, driver_id } = req.body;
  if (!customer_id || !driver_id) {
    return res.status(400).json({ error: "customer_id and driver_id required" });
  }

  // Check if exists
  let chat = db.chats.find((c: DbChat) => c.customer_id === customer_id && c.driver_id === driver_id);
  if (!chat) {
    chat = {
      id: "chat-" + Date.now(),
      customer_id,
      driver_id
    };
    db.chats.push(chat);
    
    // Add introductory message
    const drv = db.users.find((u: DbUser) => u.id === driver_id);
    db.messages.push({
      id: "msg-" + Date.now(),
      chat_id: chat.id,
      sender_id: driver_id,
      message: `Halo! Saya ${drv?.name || "Driver"} siap membantu membelikan makanan/minuman apa saja di area Kemayoran. Silakan sebutkan pesanan Anda!`,
      image_url: null,
      created_at: new Date().toISOString(),
      is_read: false
    });

    writeDb(db);
  }

  res.json(chat);
});

// Messages
app.get("/api/chats/:chat_id/messages", (req, res) => {
  const { chat_id } = req.params;
  const filtered = db.messages.filter((m: DbMessage) => m.chat_id === chat_id);
  
  // Mark as read
  filtered.forEach((m: DbMessage) => {
    m.is_read = true;
  });
  writeDb(db);

  res.json(filtered);
});

app.post("/api/messages", (req, res) => {
  const { chat_id, sender_id, message, image_url, latitude, longitude } = req.body;
  if (!chat_id || !sender_id) {
    return res.status(400).json({ error: "chat_id and sender_id are required" });
  }

  const newMsg: DbMessage = {
    id: "msg-" + Date.now(),
    chat_id,
    sender_id,
    message: message || (image_url ? "[Gambar]" : latitude ? "[Lokasi]" : ""),
    image_url: image_url || null,
    latitude: latitude || null,
    longitude: longitude || null,
    created_at: new Date().toISOString(),
    is_read: false
  };

  db.messages.push(newMsg);

  // Update chat last updated
  const chat = db.chats.find((c: DbChat) => c.id === chat_id);
  if (chat) {
    chat.last_message_text = newMsg.message;
    chat.last_message_time = newMsg.created_at;
  }

  writeDb(db);
  res.json(newMsg);
});

// Orders Flow
app.get("/api/orders", (req, res) => {
  const { user_id, role } = req.query;
  let filtered = db.orders;

  if (user_id) {
    if (role === "driver") {
      filtered = db.orders.filter((o: DbOrder) => o.driver_id === user_id);
    } else if (role === "customer") {
      filtered = db.orders.filter((o: DbOrder) => o.customer_id === user_id);
    }
  }

  // Populate naming
  const ordersWithNames = filtered.map((o: DbOrder) => {
    const cust = db.users.find((u: DbUser) => u.id === o.customer_id);
    const drv = db.users.find((u: DbUser) => u.id === o.driver_id);
    return {
      ...o,
      customer_name: cust ? cust.name : "Customer",
      driver_name: drv ? drv.name : "Driver",
      driver_phone: drv ? drv.phone : ""
    };
  });

  res.json(ordersWithNames);
});

app.post("/api/orders/create", (req, res) => {
  const { customer_id, driver_id, item_description, food_price, delivery_fee } = req.body;
  if (!customer_id || !driver_id || !item_description) {
    return res.status(400).json({ error: "Missing required order fields" });
  }

  const fPrice = parseFloat(food_price) || 0;
  const dFee = parseFloat(delivery_fee) || 12000; // Kemayoran flat base fee or estimated size page

  const newOrder: DbOrder = {
    id: "ord-" + Math.floor(1000 + Math.random() * 9000),
    customer_id,
    driver_id,
    item_description,
    food_price: fPrice,
    delivery_fee: dFee,
    total_price: fPrice + dFee,
    payment_proof: null,
    status: "Menunggu Pembayaran",
    created_at: new Date().toISOString()
  };

  db.orders.push(newOrder);

  // Send a helper system message to the chat
  const chat = db.chats.find((c: DbChat) => c.customer_id === customer_id && c.driver_id === driver_id);
  if (chat) {
    const systemMsg = `📋 *RINCIAN ORDER DIBUAT*:\n${item_description}\n• Harga makanan: Rp ${fPrice.toLocaleString('id-ID')}\n• Ongkir Jastip (Kemayoran): Rp ${dFee.toLocaleString('id-ID')}\n• Total Pembayaran: Rp ${(fPrice + dFee).toLocaleString('id-ID')}\n\nSilakan klik tombol bayar di dashboard order Anda untuk transfer QRIS.`;
    db.messages.push({
      id: "msg-sys-" + Date.now(),
      chat_id: chat.id,
      sender_id: driver_id, // sent on behalf of driver
      message: systemMsg,
      image_url: null,
      created_at: new Date().toISOString(),
      is_read: false
    });
  }

  writeDb(db);
  res.json(newOrder);
});

// Update Order Status
app.post("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, payment_proof } = req.body;
  const order = db.orders.find((o: DbOrder) => o.id === id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (status) {
    order.status = status as OrderStatus;
  }
  if (payment_proof) {
    order.payment_proof = payment_proof;
  }

  // Create payment record when payment proof is uploaded
  if (payment_proof || status === "Menunggu Verifikasi") {
    let payment = db.payments.find((p: DbPayment) => p.order_id === id);
    if (!payment) {
      payment = {
        id: "pay-" + Date.now(),
        order_id: id,
        payment_proof: payment_proof || order.payment_proof || "",
        verification_status: "pending",
        created_at: new Date().toISOString()
      };
      db.payments.push(payment);
    } else {
      if (payment_proof) payment.payment_proof = payment_proof;
      payment.verification_status = "pending";
    }
  }

  // Generate system messages in chat based on status changes for rich simulation
  const chat = db.chats.find((c: DbChat) => c.customer_id === order.customer_id && c.driver_id === order.driver_id);
  if (chat) {
    let msgText = "";
    if (status === "Menunggu Verifikasi") {
      msgText = `💸 Customer telah mengirim bukti pembayaran untuk Order #${order.id}. Menunggu verifikasi admin/driver.`;
    } else if (status === "Sedang Belanja") {
      msgText = `🛍️ Driver sedang membelikan pesanan Anda: "${order.item_description}"`;
    } else if (status === "Dalam Perjalanan") {
      msgText = `🛵 Driver dalam perjalanan mengantarkan pesanan Anda ke lokasi tujuan di Kemayoran!`;
    } else if (status === "Selesai") {
      msgText = `✅ Pesanan #${order.id} telah selesai diterima oleh Customer. Terima kasih telah menggunakan NITIP DONG!`;
    } else if (status === "Dibatalkan") {
      msgText = `❌ Pesanan #${order.id} telah dibatalkan.`;
    }

    if (msgText) {
      db.messages.push({
        id: "msg-sys-status-" + Date.now(),
        chat_id: chat.id,
        sender_id: "admin-1", // system/admin notification
        message: msgText,
        image_url: null,
        created_at: new Date().toISOString(),
        is_read: false
      });
    }
  }

  writeDb(db);
  res.json(order);
});

// Admin Payments Approve/Reject
app.post("/api/admin/payments/:id/verify", (req, res) => {
  const { id } = req.params; // payment id
  const { action } = req.body; // 'approve' or 'reject'
  
  const payment = db.payments.find((p: DbPayment) => p.id === id);
  if (!payment) {
    return res.status(404).json({ error: "Payment record not found" });
  }

  payment.verification_status = action === "approve" ? "approved" : "rejected";

  // Update original order
  const order = db.orders.find((o: DbOrder) => o.id === payment.order_id);
  if (order) {
    if (action === "approve") {
      order.status = "Sedang Belanja";
    } else {
      order.status = "Menunggu Pembayaran"; // reject changes status back
    }
  }

  // System notification
  if (order) {
    const chat = db.chats.find((c: DbChat) => c.customer_id === order.customer_id && c.driver_id === order.driver_id);
    if (chat) {
      const msgText = action === "approve" 
        ? `💚 Pembayaran disetujui Admin! Driver segera membelikan jastip Anda.` 
        : `⚠️ Bukti transfer ditolak oleh Admin. Silakan upload bukti transfer QRIS yang valid kembali.`;
      db.messages.push({
        id: "msg-sys-pay-" + Date.now(),
        chat_id: chat.id,
        sender_id: "admin-1",
        message: msgText,
        image_url: null,
        created_at: new Date().toISOString(),
        is_read: false
      });
    }
  }

  writeDb(db);
  res.json({ payment, order });
});

// Admin update Driver status (suspend / approve)
app.post("/api/admin/drivers/:id/status", (req, res) => {
  const { id } = req.params; // driver.user_id or driver.id
  const { status } = req.body; // 'free', 'working', 'suspended', etc.

  const driver = db.drivers.find((d: DbDriver) => d.user_id === id || d.id === id);
  if (!driver) {
    return res.status(404).json({ error: "Driver not found" });
  }

  driver.status = status;
  writeDb(db);
  res.json(driver);
});


// ---------------- EXPRESS VITE OR STATIC SERVING ----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
}

startServer();
