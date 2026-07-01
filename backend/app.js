const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");
const attachmentsApi = require("./routes/attachments");   // << เพิ่มบรรทัดนี้
// Swagger
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
dotenv.config();

dotenv.config();

const app = express();

//ตัวนี้ทำให้ดูไฟล์ได้
const uploadsPath = path.join(__dirname, 'uploads');



app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }));
app.use(cors({
  // อนุญาตให้ทุกลิงก์เข้าถึงได้ในช่วงพัฒนา หรือระบุชื่อลิงก์ ngrok ของคุณ
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// app.use(cors());
app.use(express.urlencoded({ extended: true }));  // ใส่คู่กับ express.json()
app.use(express.json());
app.use(morgan("dev"));


app.use(express.static(uploadsPath));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Health
//http://localhost:7000/health
app.get("/health", (req, res) => {
  res.json({ service: "Its ok!", time: new Date().toISOString() });
});

// ให้ /openapi.json ส่งไฟล์จริงแบบ no-store เพื่อไม่ให้แคช
app.get("/openapi.json", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "openapi.json"));
});

// ให้ Swagger UI ไปดึงสเปกจาก URL ด้านบน (สดใหม่เสมอ)
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: { url: "/openapi.json" },
  })
);
const userRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const evaluateeRoutes = require("./routes/evaluatee.routes");
const evaluatorRoutes = require("./routes/evaluator.routes");
const adminRoutes = require("./routes/admin.routes");
const profileRoutes = require("./routes/profile.routes");

// http://localhost:7000/api/auth/login
// app.use('/api/auth', require('./routes/auth.routes'));
app.use("/api/auth", authRoutes);

// http://localhost:7000/api/users
app.use("/api/users", userRoutes);

// http://localhost:7000/api/upload
app.use("/api/upload", uploadRoutes);
// จะได้ /api/periods/active, /api/indicators, ...

// << เส้นทางสำหรับ Period/Indicator/EvidenceType และ POST /attachments
app.use("/api", attachmentsApi);           // จะได้ /api/periods/active, /api/indicators, ...


app.use("/api/evaluator", evaluatorRoutes)

// http://localhost:7000/api/evaluatee
app.use("/api/evaluatee", evaluateeRoutes);

app.use("/api/admin", adminRoutes);         

app.use("/api/profile", profileRoutes);


app.use("/uploads",express.static(path.join(__dirname, "uploads"))
)


app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "ไม่พบหน้านี้" });
});


// Error handler
const error = require("./middlewares/error");
app.use(error);
// console.log(module);// Debug: log the module object to see its properties





module.exports = app;
