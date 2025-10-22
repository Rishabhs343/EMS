import { PrismaClient, Role, EmployeeStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      passwordHash: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Create HR user
  const hrPassword = await bcrypt.hash('hr123', 12);
  
  const hr = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      email: 'hr@company.com',
      passwordHash: hrPassword,
      role: Role.HR,
    },
  });

  // Create sample employees
  const employees = [
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@company.com',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      dateOfJoining: new Date('2022-03-15'),
      status: EmployeeStatus.ACTIVE,
      notes: 'Lead developer on the main product team.',
    },
    {
      name: 'Bob Smith',
      email: 'bob.smith@company.com',
      department: 'Engineering',
      position: 'Software Engineer',
      dateOfJoining: new Date('2023-01-10'),
      status: EmployeeStatus.ACTIVE,
      notes: 'Full-stack developer specializing in React and Node.js.',
    },
    {
      name: 'Carol Davis',
      email: 'carol.davis@company.com',
      department: 'Engineering',
      position: 'DevOps Engineer',
      dateOfJoining: new Date('2022-08-20'),
      status: EmployeeStatus.ACTIVE,
      notes: 'Manages cloud infrastructure and CI/CD pipelines.',
    },
    {
      name: 'David Wilson',
      email: 'david.wilson@company.com',
      department: 'Engineering',
      position: 'Frontend Developer',
      dateOfJoining: new Date('2023-06-01'),
      status: EmployeeStatus.ACTIVE,
      notes: 'UI/UX focused developer with expertise in modern frameworks.',
    },
    {
      name: 'Eva Brown',
      email: 'eva.brown@company.com',
      department: 'HR',
      position: 'HR Manager',
      dateOfJoining: new Date('2021-11-05'),
      status: EmployeeStatus.ACTIVE,
      notes: 'Oversees recruitment and employee relations.',
    },
    {
      name: 'Frank Miller',
      email: 'frank.miller@company.com',
      department: 'HR',
      position: 'Recruiter',
      dateOfJoining: new Date('2023-02-14'),
      status: EmployeeStatus.ACTIVE,
      notes: 'Specializes in technical recruitment.',
    },
    {
      name: 'Grace Lee',
      email: 'grace.lee@company.com',
      department: 'Finance',
      position: 'Finance Manager',
      dateOfJoining: new Date('2022-01-15'),
      status: EmployeeStatus.ACTIVE,
      notes: 'Manages company finances and budgeting.',
    },
    {
      name: 'Henry Taylor',
      email: 'henry.taylor@company.com',
      department: 'Finance',
      position: 'Accountant',
      dateOfJoining: new Date('2023-04-10'),
      status: EmployeeStatus.ACTIVE,
      notes: 'Handles day-to-day accounting operations.',
    },
    {
      name: 'Ivy Chen',
      email: 'ivy.chen@company.com',
      department: 'Sales',
      position: 'Sales Director',
      dateOfJoining: new Date('2021-09-12'),
      status: EmployeeStatus.ACTIVE,
      notes: 'Leads the sales team and drives revenue growth.',
    },
    {
      name: 'Jack Anderson',
      email: 'jack.anderson@company.com',
      department: 'Sales',
      position: 'Sales Representative',
      dateOfJoining: new Date('2023-03-22'),
      status: EmployeeStatus.ACTIVE,
      notes: 'Focuses on enterprise client acquisition.',
    },
    {
      name: 'Kate Rodriguez',
      email: 'kate.rodriguez@company.com',
      department: 'Engineering',
      position: 'Backend Developer',
      dateOfJoining: new Date('2022-12-01'),
      status: EmployeeStatus.RESIGNED,
      notes: 'Left to pursue other opportunities.',
    },
    {
      name: 'Liam O\'Connor',
      email: 'liam.oconnor@company.com',
      department: 'Sales',
      position: 'Sales Representative',
      dateOfJoining: new Date('2023-07-15'),
      status: EmployeeStatus.ACTIVE,
      notes: 'New team member, still in training.',
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { email: employee.email },
      update: {},
      create: employee,
    });
  }

  console.log('Database seeded successfully!');
  console.log('Admin user: admin@company.com / admin123');
  console.log('HR user: hr@company.com / hr123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
