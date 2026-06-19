import { 
  DbUser, DbDriver, DbChat, DbMessage, DbOrder, DbPayment, OrderStatus 
} from '../types';

const LOCAL_STORAGE_DB_KEY = "nitip_dong_local_db_v3";

function getInitialDb() {
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
      rating: 5.0,
      email: "anggiprastyan82@gmail.com"
    }
  ];

  const initialDrivers: DbDriver[] = [
    {
      id: "dbdriver-1",
      user_id: "driver-1",
      online_status: "offline",
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
      online_status: "offline",
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

  return {
    users: initialUsers,
    drivers: initialDrivers,
    chats: initialChats,
    messages: initialMessages,
    orders: [] as DbOrder[],
    payments: [] as DbPayment[]
  };
}

export function readLocalDb() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse local storage db", e);
  }
  const fresh = getInitialDb();
  writeLocalDb(fresh);
  return fresh;
}

export function writeLocalDb(data: any) {
  try {
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save local storage db", e);
  }
}

export function localResetDb() {
  const fresh = getInitialDb();
  writeLocalDb(fresh);
  return fresh;
}

export function localGetState() {
  const db = readLocalDb();
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
  return {
    ...db,
    drivers: joinedDrivers
  };
}

export function localUserLogin(phone: string, name?: string, role?: 'customer' | 'driver' | 'admin') {
  const db = readLocalDb();
  if (!phone) {
    throw new Error("Nomor HP wajib diisi");
  }

  if (role === "admin") {
    const existingAdmin = db.users.find((u: DbUser) => u.phone === phone && u.role === "admin" && u.email && u.email.toLowerCase().startsWith("anggiprastyan82@gmail"));
    if (!existingAdmin) {
      throw new Error("Sesi Admin Terkunci! Login Admin wajib menggunakan Google Login dengan akun pemilik yang terdaftar.");
    }
  }

  let user = db.users.find((u: DbUser) => u.phone === phone);
  if (!user) {
    user = {
      id: "user-" + Date.now(),
      role: role || "customer",
      name: name || "Customer " + phone.slice(-4),
      phone,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      rating: 5.0
    };
    db.users.push(user);
  } else {
    if (name) user.name = name;
    if (role) user.role = role;
  }

  if (user.role === "driver") {
    let driverObj = db.drivers.find((d: DbDriver) => d.user_id === user!.id);
    if (!driverObj) {
      driverObj = {
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
    } else {
      driverObj.online_status = "online";
    }
  }

  writeLocalDb(db);
  return user;
}

export function localUserGoogleLogin(email: string, name?: string, role?: 'customer' | 'driver' | 'admin') {
  const db = readLocalDb();

  if (role === "admin") {
    if (!email || !email.toLowerCase().startsWith("anggiprastyan82@gmail")) {
      throw new Error("Akses Ditolak: Hanya email pemilik yang diperbolehkan mengakses dashboard Admin.");
    }
  }

  const dummyPhone = "0812" + Math.floor(10000000 + Math.random() * 90000000);
  let user = email ? db.users.find((u: DbUser) => u.email === email) : null;
  if (!user) {
    user = db.users.find((u: DbUser) => u.name === name);
  }

  if (!user) {
    user = {
      id: "user-g-" + Date.now(),
      role: role || "customer",
      name: name || "Google User",
      phone: dummyPhone,
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200`,
      rating: 5.0,
      email: email || undefined
    };
    db.users.push(user);
  } else {
    if (name) user.name = name;
    if (role) user.role = role;
    if (email) user.email = email;
  }

  if (user.role === "driver") {
    let driverObj = db.drivers.find((d: DbDriver) => d.user_id === user!.id);
    if (!driverObj) {
      driverObj = {
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
    } else {
      driverObj.online_status = "online";
      driverObj.name = user.name;
      driverObj.phone = user.phone;
    }
  }

  writeLocalDb(db);
  return user;
}

export function localStartChat(customerId: string, driverId: string) {
  const db = readLocalDb();
  let chat = db.chats.find((c: DbChat) => c.customer_id === customerId && c.driver_id === driverId);
  if (!chat) {
    chat = {
      id: "chat-" + Date.now(),
      customer_id: customerId,
      driver_id: driverId
    };
    db.chats.push(chat);

    const drv = db.users.find((u: DbUser) => u.id === driverId);
    db.messages.push({
      id: "msg-" + Date.now(),
      chat_id: chat.id,
      sender_id: driverId,
      message: `Halo! Saya ${drv?.name || "Driver"} siap membantu membelikan makanan/minuman apa saja di area Kemayoran. Silakan sebutkan pesanan Anda!`,
      image_url: null,
      created_at: new Date().toISOString(),
      is_read: false
    });

    writeLocalDb(db);
  }
  return chat;
}

export function localSendMessage(chatId: string, senderId: string, messageText: string, imageUrl?: string | null, latitude?: number | null, longitude?: number | null) {
  const db = readLocalDb();
  
  const newMsg: DbMessage = {
    id: "msg-" + Date.now(),
    chat_id: chatId,
    sender_id: senderId,
    message: messageText || (imageUrl ? "[Gambar]" : latitude ? "[Lokasi]" : ""),
    image_url: imageUrl || null,
    latitude: latitude || null,
    longitude: longitude || null,
    created_at: new Date().toISOString(),
    is_read: false
  };

  db.messages.push(newMsg);

  const chat = db.chats.find((c: DbChat) => c.id === chatId);
  if (chat) {
    chat.last_message_text = newMsg.message;
    chat.last_message_time = newMsg.created_at;
  }

  writeLocalDb(db);
  return newMsg;
}

export function localToggleOnline(userId: string, onlineStatus: 'online' | 'offline') {
  const db = readLocalDb();
  const driver = db.drivers.find((d: DbDriver) => d.user_id === userId);
  if (driver) {
    driver.online_status = onlineStatus;
    writeLocalDb(db);
  }
  return driver;
}

export function localUpdateLocation(userId: string, lat: number, lng: number) {
  const db = readLocalDb();
  const driver = db.drivers.find((d: DbDriver) => d.user_id === userId);
  if (driver) {
    driver.latitude = lat;
    driver.longitude = lng;
    writeLocalDb(db);
  }
  return driver;
}

export function localCreateOrder(driverId: string, customerId: string, itemDescription: string, foodPrice: number, deliveryFee: number) {
  const db = readLocalDb();
  
  const fPrice = parseFloat(foodPrice as any) || 0;
  const dFee = parseFloat(deliveryFee as any) || 12000;

  const newOrder: DbOrder = {
    id: "ord-" + Math.floor(1000 + Math.random() * 9000),
    customer_id: customerId,
    driver_id: driverId,
    item_description: itemDescription,
    food_price: fPrice,
    delivery_fee: dFee,
    total_price: fPrice + dFee,
    payment_proof: null,
    status: "Menunggu Pembayaran",
    created_at: new Date().toISOString()
  };

  db.orders.push(newOrder);

  const chat = db.chats.find((c: DbChat) => c.customer_id === customerId && c.driver_id === driverId);
  if (chat) {
    const systemMsg = `📋 *RINCIAN ORDER DIBUAT*:\n${itemDescription}\n• Harga makanan: Rp ${fPrice.toLocaleString('id-ID')}\n• Ongkir Jastip (Kemayoran): Rp ${dFee.toLocaleString('id-ID')}\n• Total Pembayaran: Rp ${(fPrice + dFee).toLocaleString('id-ID')}\n\nSilakan klik tombol bayar di dashboard order Anda untuk transfer QRIS.`;
    db.messages.push({
      id: "msg-sys-" + Date.now(),
      chat_id: chat.id,
      sender_id: driverId,
      message: systemMsg,
      image_url: null,
      created_at: new Date().toISOString(),
      is_read: false
    });
  }

  writeLocalDb(db);
  return newOrder;
}

export function localUpdateOrderStatus(orderId: string, status?: string, paymentProof?: string) {
  const db = readLocalDb();
  const order = db.orders.find((o: DbOrder) => o.id === orderId);
  if (!order) return null;

  if (status) {
    order.status = status as OrderStatus;
  }
  if (paymentProof) {
    order.payment_proof = paymentProof;
  }

  if (paymentProof || status === "Menunggu Verifikasi") {
    let payment = db.payments.find((p: DbPayment) => p.order_id === orderId);
    if (!payment) {
      payment = {
        id: "pay-" + Date.now(),
        order_id: orderId,
        payment_proof: paymentProof || order.payment_proof || "",
        verification_status: "pending",
        created_at: new Date().toISOString()
      };
      db.payments.push(payment);
    } else {
      if (paymentProof) payment.payment_proof = paymentProof;
      payment.verification_status = "pending";
    }
  }

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
        sender_id: "admin-1",
        message: msgText,
        image_url: null,
        created_at: new Date().toISOString(),
        is_read: false
      });
    }
  }

  writeLocalDb(db);
  return order;
}

export function localVerifyPayment(paymentId: string, action: 'approve' | 'reject') {
  const db = readLocalDb();
  const payment = db.payments.find((p: DbPayment) => p.id === paymentId);
  if (!payment) return null;

  payment.verification_status = action === "approve" ? "approved" : "rejected";

  const order = db.orders.find((o: DbOrder) => o.id === payment.order_id);
  if (order) {
    if (action === "approve") {
      order.status = "Sedang Belanja";
    } else {
      order.status = "Menunggu Pembayaran";
    }

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

  writeLocalDb(db);
  return { payment, order };
}

export function localUpdateDriverStatusByAdmin(id: string, status: string) {
  const db = readLocalDb();
  const driver = db.drivers.find((d: DbDriver) => d.user_id === id || d.id === id);
  if (driver) {
    driver.status = status;
    writeLocalDb(db);
  }
  return driver;
}
