# User Management System
## Quick Setup
A full-stack web application for managing users with authentication, CRUD operations, and role-based access control.
🚀 Features 
Frontend (React)

Modern UI: Beautiful interface built with Ant Design and Tailwind CSS
Authentication: Login/logout functionality with token management
User Dashboard: View, create, edit, and delete users
Advanced Features: Search, filtering, pagination, and user details drawer
Responsive Design: Mobile-friendly responsive layout
Form Validation: Client-side validation for all user inputs

🛠️ Tech Stack 
Frontend

React - Frontend library
React Router - Client-side routing
Ant Design - UI component library
Tailwind CSS - Utility-first CSS framework
dayjs - Date manipulation library

Node.js (v14 or higher)
npm or yarn package manager


Navigate to frontend directory
bashcd ../frontend

Install dependencies
bashnpm install

Start the development server
bashnpm start
The application will be available at https://qa-frontend-task-production.up.railway.app/

🔑 API Endpoints
Authentication

POST /login - User login

Users

GET /users - Get all users (with pagination, search, filters)
GET /users/:id - Get specific user
POST /users - Create new user (admin only)
PUT /users/:id - Update user
DELETE /users/:id - Delete user (admin only)

Statistics

GET /users/stats/overview - Get user statistics (admin only)

Metadata

GET /metadata - Get available roles and positions

👥 Default Users
The system comes with two pre-configured users for testing:
Admin User

Email: ali@example.com
Password: password
Role: admin
Position: Full Stack Developer

Regular User

Email: sara@example.com
Password: password123
Role: user
Position: Marketing Specialist

🔐 User Roles
The system supports the following roles:

admin - Full access to all features
manager - Management-level access
supervisor - Supervisory access
user - Standard user access
employee - Basic employee access

📱 Available Positions
The system includes 15 predefined positions:

Frontend Developer
Backend Developer
Full Stack Developer
DevOps Engineer
Product Manager
UI/UX Designer
Data Analyst
QA Engineer
System Administrator
Marketing Specialist
Sales Representative
HR Manager
Financial Analyst
Business Analyst
Project Manager

🎨 Features Overview
Dashboard Features

User Statistics: Total users, average age, average salary, departments
User Table: Sortable, searchable, and filterable user list
User Actions: View details, edit, delete (role-based)
Pagination: Efficient data loading with pagination controls

User Management

Create Users: Add new users with comprehensive information
Edit Users: Update existing user information
User Details: Detailed view with all user information
Search & Filter: Find users by name, email, role, or department

Security Features

JWT Authentication: Secure token-based authentication
Password Security: Bcrypt hashing for password protection
Rate Limiting: Prevent abuse with configurable rate limits
Input Validation: Comprehensive server-side validation
Role-based Access: Different permissions based on user roles

🚦 Usage

Login: Use one of the default credentials to log in
Dashboard: View user statistics and browse the user list
Add User: Click "Add User" to create a new user (admin only)
Edit User: Click the edit icon to modify user information
View Details: Click the eye icon to see detailed user information
Search: Use the search bar to find specific users
Filter: Use table filters to narrow down the user list

🔒 Security Considerations

All passwords are hashed using bcrypt
JWT tokens expire after 24 hours
Rate limiting prevents brute force attacks
Input validation prevents injection attacks
CORS properly configured for frontend access
Helmet.js provides security headers

🐛 Troubleshooting
Common Issues

"Route not found" error

Ensure you're accessing the correct API endpoints
Check if the backend server is running


Authentication errors

Verify JWT_SECRET is set in environment variables
Check if token has expired (24-hour expiry)


CORS errors

Ensure frontend and backend URLs are properly configured
Check CORS settings in the backend



📝 Development Notes

The backend uses in-memory storage for demo purposes
For production, integrate with a proper database (MongoDB, PostgreSQL, etc.)
Environment variables should be properly secured in production
Consider implementing refresh token mechanism for enhanced security

🤝 Contributing

Fork the repository
Create a feature branch
Commit your changes
Push to the branch
Create a Pull Request