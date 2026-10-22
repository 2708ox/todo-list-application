# Todo List Application (React + Next.js App Router + Tailwind CSS + PostgreSQL)

แอปพลิเคชันจัดการรายการสิ่งที่ต้องทำ (Todo List) แบบ Fullstack ตามสถาปัตยกรรมโครงสร้างโปรเจกต์ Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui

---

## 🌟 คุณสมบัติเด่น (Features)

1. **Frontend (React & Tailwind CSS)**
   - เพิ่มรายการ Todo พร้อมระบุรายละเอียด (Description), ระดับความสำคัญ (Priority: Low / Medium / High) และหมวดหมู่ (Category)
   - ลบรายการ Todo เดี่ยว หรือล้างรายการที่ทำเสร็จแล้วทั้งหมด (Clear Completed)
   - ปรับสถานะเสร็จสิ้น (Toggle Complete) พร้อมเอฟเฟกต์ Checkbox แบบ Interactive
   - แก้ไขรายการในตัว (Inline Edit) ทั้งชื่อ, รายละเอียด, ระดับความสำคัญ และหมวดหมู่
   - ระบบค้นหาด่วน (Search Filter) ตามชื่อ, รายละเอียด หรือหมวดหมู่
   - ตัวกรองแท็บ (Tabs): ทั้งหมด (All), ยังไม่เสร็จ (Active), เสร็จแล้ว (Completed), สำคัญสูง (High Priority)
   - เรียงลำดับรายการ (Sort): ล่าสุดมาก่อน, เก่าสุดมาก่อน, ตามระดับความสำคัญ
   - แถบแสดงความคืบหน้า (Progress Bar) และสถิติแบบ Real-time
   - ดีไซน์ Responsive เต็มรูปแบบ รองรับทั้งหน้าจอโทรศัพท์ (Mobile) แท็บเล็ต และคอมพิวเตอร์ (Desktop)

2. **Backend (RESTful API Server)**
   - พัฒนาด้วย Next.js Route Handlers (TypeScript)
   - รองรับมาตรฐาน CRUD ครบถ้วน (Create, Read, Update, Delete):
     - `GET /api/todos`: ดึงรายการทั้งหมด
     - `POST /api/todos`: สร้างรายการใหม่
     - `GET /api/todos/:id`: ดึงข้อมูลรายการเดี่ยว
     - `PUT /api/todos/:id` หรือ `PATCH /api/todos/:id`: แก้ไขข้อมูลและสลับสถานะ
     - `DELETE /api/todos/:id`: ลบรายการ
     - `GET /api/health`: ตรวจสอบสถานะ Server และการเชื่อมต่อฐานข้อมูล
   - มีระบบ Validation ป้องกันข้อมูลว่างหรือผิดรูปแบบ

3. **Database (PostgreSQL Integration)**
   - เชื่อมต่อ PostgreSQL ผ่าน Connection Pool (`pg`)
   - สร้างตาราง `todos` อัตโนมัติเมื่อเริ่มเชื่อมต่อ (Auto Schema Migration)
   - **ระบบ Smart Fallback**: หาก PostgreSQL ในเครื่องยังไม่ได้เปิดทำงาน ระบบจะสลับไปใช้ In-Memory Store ให้อัตโนมัติ ทำให้ทดสอบและใช้งานแอปพลิเคชันได้ทันทีโดยไม่ Error

4. **API Testing (Postman Collection)**
   - มีไฟล์ `postman_collection.json` และดาวน์โหลดได้โดยตรงจาก UI
   - ครบทุก Endpoint พร้อมตัวอย่าง Request body และ cURL command

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Todo List Application/
├── .next/                         # ไดเรกทอรี Build ของ Next.js
├── app/                           # App Router (Frontend & REST API)
│   ├── api/
│   │   ├── health/route.ts        # Endpoint ตรวจสอบสถานะ DB & Health
│   │   └── todos/
│   │       ├── route.ts           # GET (Read All) & POST (Create)
│   │       └── [id]/route.ts      # GET, PUT (Update), DELETE
│   ├── globals.css                # สไตล์หลัก Tailwind CSS
│   ├── layout.tsx                 # Root Layout
│   └── page.tsx                   # หน้าหลัก Todo List App (React)
├── components/                    # คอมโพเนนต์ React
│   ├── Navbar.tsx                 # แถบเมนูด้านบน แสดงความคืบหน้า และปุ่มรีเฟรช
│   ├── TodoInput.tsx              # ฟอร์มเพิ่มรายการพร้อม Priority และหมวดหมู่
│   ├── TodoItem.tsx               # การ์ดแสดงรายการ, Checkbox, Inline Edit, ปุ่มลบ
│   └── TodoList.tsx               # คอนเทนเนอร์รายการ, ระบบค้นหา, ตัวกรอง, จัดเรียง
├── lib/
│   ├── db.ts                      # จัดการเชื่อมต่อ PostgreSQL & CRUD Fallback
│   ├── rateLimit.ts               # ระบบป้องกัน DoS & Brute-Force Rate Limiting
│   ├── types.ts                   # Type Definitions (Todo, Priority, API)
│   └── utils.ts                   # ฟังก์ชัน Utility (cn / tailwind-merge)
├── public/
│   └── todo_list_api.postman_collection.json  # ไฟล์ Postman Collection
├── .env.example                   # ตัวอย่างการตั้งค่า Environment
├── .env.local                     # ค่าการเชื่อมต่อฐานข้อมูล
├── components.json                # ไฟล์ตั้งค่า shadcn/ui
├── eslint.config.mjs              # ESLint Configuration
├── next.config.ts                 # Next.js Configuration
├── package.json                   # รายการ Dependencies และ Scripts
├── postman_collection.json        # Postman Collection สำหรับนำเข้า
└── tsconfig.json                  # TypeScript Configuration
```

---

## 🚀 วิธีการรันโปรเจกต์ (Quick Start)

### 1. ติดตั้ง Dependencies (ถ้ายังไม่ได้รัน)
```bash
npm install
```

### 2. รันโหมด Development
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่: [http://localhost:3000](http://localhost:3000)

### 3. รันโหมด Production Build
```bash
npm run build
npm start
```

---

## 🗄️ การตั้งค่า PostgreSQL (Database Setup)

กำหนดค่า Connection String ในไฟล์ `.env.local`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/todolist
```

### คำสั่งสร้างตารางใน PostgreSQL (SQL Schema):
```sql
CREATE TABLE IF NOT EXISTS todos (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
*(เมื่อแอปเชื่อมต่อกับฐานข้อมูลสำเร็จ ตารางนี้จะถูกสร้างให้อัตโนมัติหากยังไม่มี)*

---

## 📮 การทดสอบ API ด้วย Postman (Requirement #9)

1. เปิดโปรแกรม **Postman**
2. คลิกปุ่ม **Import**
3. เลือกไฟล์ `postman_collection.json` จากโฟลเดอร์โปรเจกต์
4. ทดสอบส่งคำขอทั้ง 6 รายการ:
   - `1. Health & DB Status` (`GET /api/health`)
   - `2. Get All Todos` (`GET /api/todos`)
   - `3. Create Todo` (`POST /api/todos`)
   - `4. Get Single Todo` (`GET /api/todos/:id`)
   - `5. Update Todo` (`PUT /api/todos/:id`)
   - `6. Delete Todo` (`DELETE /api/todos/:id`)
