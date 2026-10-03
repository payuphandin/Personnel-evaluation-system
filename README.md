# Personnel Evaluation System

ระบบประเมินบุคลากร ประกอบด้วย Frontend (Nuxt 3), Backend (Node.js/Express) และ MySQL

## สิ่งที่ต้องมี

- Node.js 20+
- npm
- Docker Desktop

## วิธีติดตั้ง

### 1. เริ่ม Database

```bash
docker compose -f docker-compose_mysql.yml up -d
```

MySQL ใช้ port `3306` และ phpMyAdmin ใช้ port `8080`

หากต้องการสร้าง Database ใหม่จาก `schema.sql` ให้ลบ volume เดิมก่อน:

```bash
docker compose -f docker-compose_mysql.yml down -v
docker compose -f docker-compose_mysql.yml up -d
```

### 2. ติดตั้ง Backend

```bash
cd backend
npm install
npm run dev
```

Backend: `http://localhost:7000`

Swagger: `http://localhost:7000/docs`

### 3. ติดตั้ง Frontend

เปิด Terminal ใหม่:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

## การตั้งค่า Backend

ไฟล์ `backend/.env`:

```env
PORT=7000
CORS_ORIGIN=http://localhost:3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=skills_db
JWT_SECRET=testing123
JWT_EXPIRES=2h
```

## บัญชีทดสอบ

```text
Email: admin@ccollege.ac.th
Password: 12345678
```

## URL สำคัญ

| ส่วน       | URL                        |
| ---------- | -------------------------- |
| Frontend   | http://localhost:3000      |
| Backend    | http://localhost:7000      |
| Swagger    | http://localhost:7000/docs |
| phpMyAdmin | http://localhost:8080      |


