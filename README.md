# STANDING TOGETHER  

STANDING TOGETHER is a full-stack collaboration platform that provides **authentication, role-based permissions, workspaces, projects, and tasks management**.  

Built with **Node.js, Express, MongoDB, and Passport.js**, it integrates with a frontend (React/Vite) and supports **Google OAuth 2.0 and Local login**.  

---

## 🚀 Features
- 🔐 Authentication with **Google OAuth 2.0** & Local login  
- 👥 User sessions with **Passport.js & cookie-session**  
- 🛡️ Role-based access control (seeded roles & permissions)  
- 📂 Workspaces, Projects, Tasks, and Members management  
- 🌐 CORS-enabled frontend integration  
- ⚡ RESTful API structure  

----

## 🛠 Tech Stack
- **Node.js** + **Express.js**  
- **MongoDB (Mongoose)**  
- **Passport.js** (Google & Local strategies)  
- **TypeScript**  
- **cookie-session**  
- **dotenv**  

---

## ⚙️ Installation & Setup  

### 1. Clone the repository  
```
git clone  https://github.com/TarekzainAldin/Standing-together.git
cd standing-together




2. Install dependencies
npm install

3. Configure environment variables

Create a .env file in the root directory:

PORT=8000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

SESSION_SECRET=your_session_secret
SESSION_EXPIRES_IN=1d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_GOOGLE_CALLBACK_URL=http://localhost:5173/auth/callback

4. Run the server
npm run dev

📂 API Routes
Endpoint	Method	Description	Auth Required
/api/auth/google	GET	Login with Google	No
/api/auth/login	POST	Login with email & password	No
/api/user	GET	Get user profile	Yes
/api/workspace	CRUD	Manage workspaces	Yes
/api/member	CRUD	Manage workspace members	Yes
/api/project	CRUD	Manage projects	Yes
/api/task	CRUD	Manage tasks	Yes
🗄 Database Models
1. User
Field	Type	Description
name	String	User’s full name
email	String	Unique email address
password	String	Encrypted password (optional for Google users)
profilePicture	String	Profile image URL
isActive	Boolean	Account active status
lastLogin	Date	Last login timestamp
currentWorkspace	ObjectId	Reference to current workspace
2. Account
Field	Type	Description
provider	String	Auth provider (Google, Local, etc.)
providerId	String	Provider ID (email, Google ID, etc.)
userId	ObjectId	Reference to User
refreshToken	String	OAuth refresh token (optional)
tokenExpiry	Date	Token expiration
3. Workspace
Field	Type	Description
name	String	Workspace name
description	String	Workspace description
owner	ObjectId	Reference to User
inviteCode	String	Unique invite code
4. Member
Field	Type	Description
userId	ObjectId	Reference to User
workspaceId	ObjectId	Reference to Workspace
role	ObjectId	Reference to Role
joinedAt	Date	Date the member joined
5. Role
Field	Type	Description
name	String	Role name (Admin, Member, etc.)
permissions	[String]	Array of assigned permissions
6. Project
Field	Type	Description
name	String	Project name
description	String	Project description (optional)
emoji	String	Emoji tag for project (default 📊)
workspace	ObjectId	Reference to Workspace
createdBy	ObjectId	Reference to User
7. Task
Field	Type	Description
taskCode	String	Auto-generated unique task code
title	String	Task title
description	String	Task description (optional)
project	ObjectId	Reference to Project
workspace	ObjectId	Reference to Workspace
status	String	Task status (TODO, IN_PROGRESS, DONE)
priority	String	Priority (LOW, MEDIUM, HIGH)
assignedTo	ObjectId	Assigned user (optional)
createdBy	ObjectId	Reference to creator User
dueDate	Date	Task deadline
🔑 Roles & Permissions

Roles are seeded automatically via seedRoles.ts.
Each role has predefined permissions in utils/role-permission.ts.

Run the seeding script:

ts-node scripts/seedRoles.ts

🤝 Contributing

Fork the repo

Create your feature branch (git checkout -b feature/my-feature)

Commit your changes (git commit -m "Add feature")

Push to branch (git push origin feature/my-feature)

Open a Pull Request

📜 License

This project is licensed under the MIT License.


---



```


# connect to GitHub (replace with your repo URL)
git remote add origin https://github.com/TarekzainAldin/Standing-together.git

 

