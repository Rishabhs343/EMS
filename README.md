# Employee Management System Demo

A beautiful, modern employee management system built with Next.js 14, TypeScript, and shadcn/ui.

## 🚀 Features

- **Beautiful UI/UX**: Minimal luxury design with dark mode support
- **Employee Management**: Full CRUD operations with search and filtering
- **Role-Based Access**: Admin, HR, and Viewer roles with appropriate permissions
- **Activity Logging**: Track all employee changes with detailed audit trail
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Real-time Updates**: Optimistic UI with React Query
- **Form Validation**: Client and server-side validation with Zod
- **Authentication**: JWT-based auth with httpOnly cookies

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT implementation
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd employee-management-demo
   npm install
   ```

2. **Start the database:**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database:**
   ```bash
   npx tsx prisma/seed.ts
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Credentials

- **Admin**: `admin@company.com` / `admin123`
- **HR**: `hr@company.com` / `hr123`

## 📱 Features Overview

### Employee Management
- View all employees in a beautiful data table
- Search by name or email
- Filter by department, position, and status
- Pagination for large datasets
- One-click status toggle (Active/Resigned)
- Detailed employee profiles with activity logs

### Forms & Validation
- Create new employees with comprehensive validation
- Edit existing employee information
- Real-time form validation with helpful error messages
- Date validation (no future join dates)
- Email uniqueness checking

### User Experience
- Dark mode toggle with system preference detection
- Responsive design that works on all devices
- Loading states and skeleton screens
- Toast notifications for user feedback
- Optimistic UI updates for better perceived performance

### Security & Permissions
- JWT-based authentication with httpOnly cookies
- Role-based access control (Admin/HR/Viewer)
- Server-side validation on all API endpoints
- Protected routes with middleware

## 🎨 Design Philosophy

This demo showcases a **minimal luxury** design approach:

- **Clean & Spacious**: Ample whitespace and clear visual hierarchy
- **Subtle Animations**: Smooth transitions and micro-interactions
- **Consistent Typography**: Modern sans-serif with generous line height
- **Accessible**: Proper contrast ratios and keyboard navigation
- **Professional**: Enterprise-ready appearance suitable for business use

## 🔧 Development

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── login/             # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utilities and configurations
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   └── validations.ts    # Zod schemas
└── prisma/               # Database schema and migrations
```

### Key Components

- **EmployeeList**: Main data table with search and filters
- **EmployeeForm**: Create/edit form with validation
- **EmployeeDetail**: Detailed view with activity log
- **DashboardHeader**: Navigation with user menu and theme toggle
- **DashboardSidebar**: Navigation menu

### API Endpoints

- `GET /api/employees` - List employees with filters
- `POST /api/employees` - Create new employee
- `GET /api/employees/[id]` - Get employee details
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee
- `PATCH /api/employees/[id]/status` - Toggle status
- `GET /api/employees/[id]/activity` - Get activity log

## 🚀 Production Deployment

This demo is production-ready and can be deployed to:

- **Vercel** (recommended for Next.js)
- **Railway** (with PostgreSQL)
- **DigitalOcean App Platform**
- **AWS/GCP/Azure** with containerization

### Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-secret-jwt-key"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 📄 License

This is a demo project created for showcase purposes.

---

**Built with ❤️ using Next.js, TypeScript, and shadcn/ui**