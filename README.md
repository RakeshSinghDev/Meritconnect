# MeritConnect

### AI-Powered Recruitment & Career Platform

MeritConnect is a full-stack recruitment and career platform designed to connect candidates, recruiters, AI-powered career tools, job discovery, interview preparation, and government career opportunities in one ecosystem.

The platform combines traditional recruitment workflows with AI-assisted features to help candidates discover relevant opportunities, prepare for interviews, manage applications, and make better career decisions.

---

## 🚀 Live Project

### Frontend

https://meritconnects.netlify.app/

### Backend API

https://meritconnect-1.onrender.com/

### Health Check

https://meritconnect-1.onrender.com/api/health

---

# ✨ Features

## 👤 Candidate Features

### Authentication

- Candidate registration
- Candidate login
- JWT-based authentication
- Protected routes
- Refresh-token support
- Logout
- Password reset flow
- User profile
- Role-based authorization

---

## 🔎 AI Job Finder

MeritConnect includes an AI-assisted job discovery system designed to help candidates find jobs matching their profile and preferences.

Candidates can configure preferences such as:

- Target roles
- Skills
- Locations
- Remote preference
- Experience level
- Job preferences

The system can:

- Search for relevant jobs
- Filter jobs
- Rank job opportunities
- Match jobs against candidate information
- Provide personalized recommendations

The goal is to reduce the amount of irrelevant job listings a candidate has to manually search through.

### Job Finder Flow

```text
Candidate Profile
       ↓
Job Preferences
       ↓
Job Search
       ↓
Filtering
       ↓
Matching
       ↓
Recommended Jobs
       ↓
Candidate        🏛️ Government Careers

MeritConnect also provides a dedicated Government Careers section for candidates interested in Indian government recruitment opportunities.

The feature is designed around verified recruitment information and official application sources.

Potential categories include:

UPSC
SSC
Railway / RRB
IBPS
NTA
Other government recruitment organizations

Government opportunities can include information such as:

Organization
Recruitment / examination name
Post
Qualification
Vacancies
Location
Application start date
Application deadline
Exam date
Application fee
Eligibility information
Official notification
Official application link
Recruitment status
Important

MeritConnect does not submit government applications automatically.

The candidate is redirected to the official application website.

The official recruitment notification remains the final source of truth for eligibility, dates, vacancies and application requirements.

🤖 AI Interview

MeritConnect includes an AI-powered interview preparation system.

The objective is to simulate a structured technical/behavioral interview rather than simply displaying predefined questions.

The interview system can use candidate information such as:

Resume
Skills
Projects
Experience
Target role
Previous answers

The interview architecture includes components for:

Interview Engine
       ↓
Conversation Manager
       ↓
Conversation Memory
       ↓
Prompt Builder
       ↓
Gemini Service
       ↓
Evaluation Engine
       ↓
Interview Report

The system is designed to support:

Dynamic interview questions
Resume-based questioning
Follow-up questions
Conversation context
Candidate answer evaluation
Interview scoring
Interview reports
📄 Resume Management

Candidates can upload and manage their resumes.

The backend supports resume-related processing such as:

Resume upload
Resume storage
Resume parsing
Resume retrieval
Resume matching
AI-assisted resume analysis

Cloud storage can be used for uploaded resume assets.

🧠 AI Resume Matching

MeritConnect includes AI-assisted resume/job matching.

The system can compare candidate information against job requirements and provide a relevance/matching result.

Possible matching factors include:

Technical skills
Experience
Education
Job title
Job requirements
Candidate profile
Resume information

AI recommendations are intended as decision-support rather than absolute eligibility decisions.

💼 Recruiter Features

Recruiters can use MeritConnect to manage recruitment workflows.

Recruiter functionality includes areas such as:

Recruiter profile
Job creation
Job management
Candidate discovery
Candidate information
Applications
Interviews
Recruitment activities

Recruiters can publish jobs and manage candidates through the platform.

📋 Job Management

The platform supports job creation and management.

Job information can include:

Job title
Description
Skills
Requirements
Location
Employment type
Experience
Salary
Company information
Application details

Jobs can be accessed through the candidate job discovery system.

📝 Application Management

Candidates can manage their applications through the platform.

Application-related workflows include:

Job
 ↓
Application
 ↓
Recruitment Process
 ↓
Interview
 ↓
Result

Application information can be associated with:

Candidate
Job
Recruiter
Application status
Dates
Recruitment activity
📅 Interview Management

The platform supports interview-related workflows between candidates and recruiters.

Interview functionality can include:

Interview scheduling
Interview details
Interview status
Candidate information
Recruiter information
Interview management
🔔 Notifications

MeritConnect includes notification functionality for communicating important events to users.

Notifications can be associated with events such as:

Applications
Interviews
Recruitment activity
System events
Other user-related actions
📊 Activity Tracking

The platform includes activity logging for important user/recruitment events.

This allows the system to maintain a history of relevant actions.

Examples include:

Application activity
Job activity
Candidate activity
Recruiter activity
Interview activity
🔐 Authentication & Authorization

MeritConnect uses JWT-based authentication.

The backend separates authentication from authorization.

Authentication

Determines:

"Who is the user?"

Authorization

Determines:

"What is this user allowed to do?"

Supported roles include candidate/recruiter/admin-oriented workflows.

Protected backend routes use authentication middleware.

🛡️ Security

The backend includes several security-oriented middleware and practices.

Implemented technologies include:

Helmet
CORS
HTTP Parameter Pollution protection
Rate limiting
Cookie parsing
Request validation
JWT authentication
Role-based authorization
Centralized error handling
Compression

Sensitive credentials are stored using environment variables.

Secrets should never be committed to Git.

🏗️ System Architecture

MeritConnect follows a full-stack architecture.

                    MERITCONNECT
                         │
          ┌──────────────┴──────────────┐
          │                             │
       Frontend                      Backend
          │                             │
      React/Vite                    Node.js
          │                         Express.js
          │                             │
          │                    ┌────────┴────────┐
          │                    │                 │
          │                 Services          APIs
          │                    │                 │
          │                    └────────┬────────┘
          │                             │
          │                         MongoDB
          │                             │
          │                    ┌────────┴────────┐
          │                    │                 │
          │                 Cloudinary         Gemini
          │
          └──────────── HTTP/REST ────────────┘
🧰 Technology Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
React Router
Axios
Framer Motion
Lucide React
Backend
Node.js
Express.js
JavaScript
MongoDB
Mongoose
JWT
Socket.IO
AI
Google Gemini
AI-powered job matching
AI resume processing
AI interview functionality
AI-based evaluation
Storage
MongoDB Atlas
Cloudinary
Testing
Jest
Supertest
API Documentation
Swagger / OpenAPI
Deployment
Frontend

Netlify

Backend

Render

Database

MongoDB Atlas

📁 Project Structure
AI-Recruitment-Platform/
│
├── Frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.ts
│
│
├── server/
│   │
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── cloudinary.js
│   │   │   ├── gemini.js
│   │   │   └── swagger.js
│   │   │
│   │   ├── controllers/
│   │   │
│   │   ├── middleware/
│   │   │
│   │   ├── models/
│   │   │
│   │   ├── routes/
│   │   │
│   │   ├── services/
│   │   │
│   │   ├── socket/
│   │   │
│   │   ├── tests/
│   │   │
│   │   ├── utils/
│   │   │
│   │   ├── validators/
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   ├── .env.example
│   └── jest.config.js
│
└── README.md
⚙️ Local Development
Prerequisites

Install:

Node.js
npm
MongoDB Atlas account
Git

For AI features, configure the required Gemini credentials.

For file storage, configure Cloudinary credentials if required by the feature.

📥 Clone the Repository
git clone https://github.com/RakeshSinghDev/Meritconnect.git

Move into the project:

cd Meritconnect
🔧 Backend Setup

Move into the server:

cd server

Install dependencies:

npm install

Create the environment file:

cp .env.example .env

On Windows PowerShell:

Copy-Item .env.example .env

Configure the required variables in .env.

🔑 Environment Variables

The exact variables depend on the enabled services, but the backend requires configuration for services such as:

PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

JWT_REFRESH_SECRET=your_refresh_token_secret

CLIENT_URL=http://localhost:5173

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Additional email/application-specific variables may be required depending on the enabled features.

Never commit:
.env

Use:

.env.example

for documenting required configuration.

▶️ Start Backend

Development mode:

npm run dev

Production:

npm start

The backend normally runs on:

http://localhost:5000
❤️ Health Check

Once the backend is running:

GET /api/health

Example:

curl http://localhost:5000/api/health

Expected response:

{
  "success": true,
  "message": "Server is healthy"
}
🎨 Frontend Setup

Open another terminal.

From the project root:

cd Frontend

Install dependencies:

npm install

Create:

.env

Configure:

VITE_API_URL=http://localhost:5000

For production, the frontend API URL should point to the deployed backend.

Example:

VITE_API_URL=https://meritconnect-1.onrender.com

Restart Vite after changing environment variables.

▶️ Start Frontend
npm run dev

The frontend will normally be available at:

http://localhost:5173
🔄 Frontend → Backend Flow

The frontend communicates with the backend through HTTP APIs.

Example:

React Application
       ↓
Axios / API Service
       ↓
Express API
       ↓
Authentication Middleware
       ↓
Controller
       ↓
Service
       ↓
MongoDB
       ↓
Response
       ↓
React UI
🔑 Authentication Flow

A simplified authentication flow:

Candidate
   ↓
Login
   ↓
POST /api/v1/auth/login
   ↓
Validate credentials
   ↓
Generate JWT
   ↓
Frontend stores authentication state
   ↓
Protected API request
   ↓
JWT verification
   ↓
Controller

Refresh tokens are used to support persistent authentication sessions.

🧩 Backend Architecture

The backend follows a layered architecture.

Routes

Routes define API endpoints.

Example:

POST /api/v1/auth/login
Controllers

Controllers handle HTTP requests and responses.

They should not contain large amounts of business logic.

Services

Services contain business logic.

For example:

auth.service.js
job.service.js
application.service.js
interview.service.js
Models

Mongoose models represent MongoDB data structures.

Examples:

User
Job
Application
Interview
Notification
AIInterview
AIInterviewSession
AIInterviewTemplate
ActivityLog
SavedJob
Middleware

Middleware handles cross-cutting functionality such as:

Authentication
Authorization
Validation
Error handling
File uploads
Async request handling
📡 API Structure

The backend uses versioned API routes.

Examples:

/api/v1/auth
/api/v1/jobs
/api/v1/applications
/api/v1/resume
/api/v1/ai
/api/v1/recruiter
/api/v1/candidate
/api/v1/interviews
/api/v1/admin
/api/v1/notifications
/api/v1/users
/api/v1/ai-interviews
📚 API Documentation

Swagger/OpenAPI is integrated into the backend.

When enabled, the Swagger documentation can be accessed through the configured Swagger endpoint.

Check:

server/src/config/swagger.js

for the configured documentation path.

🧪 Testing

The backend contains automated tests using Jest.

Test files include areas such as:

server/src/tests/
├── application.test.js
├── auth.test.js
├── interview.test.js
├── jobs.test.js
└── setup.js

Run tests with the project's configured Jest command:

npm test

For coverage, if configured:

npm test -- --coverage
🧠 AI Architecture

AI functionality is separated into dedicated services rather than putting AI logic directly into route handlers.

For example:

Controller
    ↓
AI Service
    ↓
Gemini Service
    ↓
Gemini API
    ↓
Structured Response
    ↓
Application Logic

This makes the AI provider easier to change or extend.

🎤 AI Interview Architecture

The AI Interview system is structured around multiple components.

Candidate Resume
       ↓
Interview Configuration
       ↓
Prompt Builder
       ↓
Interview Engine
       ↓
Conversation Manager
       ↓
Conversation Memory
       ↓
Gemini Service
       ↓
Candidate Answer
       ↓
Evaluation Engine
       ↓
Interview Report

This architecture allows the interview to maintain conversational context rather than treating every question as an isolated request.

🔌 Real-Time Communication

Socket.IO is used for real-time interview-related communication.

Relevant backend components include:

server/src/socket/
├── index.js
└── aiInterviewSocket.js

This provides the foundation for real-time interview interactions.

📄 Resume Processing

Resume processing can involve:

Resume Upload
      ↓
File Storage
      ↓
Resume Parser
      ↓
Extracted Information
      ↓
Candidate Profile / AI Matching

PDF-related processing utilities are included in the backend.

☁️ Cloudinary

Cloudinary can be used for storing uploaded assets such as resumes or other supported files.

Cloudinary configuration is located in:

server/src/config/cloudinary.js

Credentials must be stored in environment variables.

🏛️ Government Opportunity Architecture

The Government Careers system is designed around a provider-based architecture.

Official Recruitment Source
          ↓
Provider
          ↓
Fetch
          ↓
Parse
          ↓
Normalize
          ↓
Validate
          ↓
Deduplicate
          ↓
MongoDB
          ↓
Government Jobs API
          ↓
MeritConnect Frontend

This architecture makes it possible to add additional recruitment sources without rewriting the entire feature.

Important

Government recruitment information should always be verified against the official notification.

MeritConnect does not automatically submit government applications.

🔍 AI Job Finder Architecture

The AI Job Finder follows a similar pipeline:

Candidate Profile
       ↓
Job Preferences
       ↓
Job Search
       ↓
Filtering
       ↓
Job Matching
       ↓
Ranking
       ↓
Recommendations

The system is intended to reduce irrelevant job results and provide candidates with more targeted opportunities.

📝 Application Tracking

Candidates can track their recruitment journey.

A typical lifecycle is:

Saved
  ↓
Applied
  ↓
Assessment
  ↓
Interview
  ↓
Offer

Alternative outcomes can include:

Rejected
Withdrawn

The application tracker is intended to provide candidates with a centralized view of their job-search activity.

🛠️ Error Handling

The backend uses centralized error handling.

The architecture includes:

Controller
    ↓
Service
    ↓
Error
    ↓
Global Error Handler
    ↓
Consistent API Response

Utility classes such as:

ApiError
ApiResponse

are used to standardize backend responses.

🚦 Rate Limiting

Rate limiting is used to reduce abuse of sensitive endpoints and protect the backend from excessive requests.

Authentication-related endpoints should receive stricter protection than ordinary read operations.

🌐 CORS

The backend supports configured frontend origins.

For local development:

http://localhost:5173

For production:

https://meritconnects.netlify.app

The deployed frontend origin must be included in the backend CORS configuration/environment.

🚀 Production Deployment
Frontend — Netlify

The frontend is deployed through Netlify.

Build command:

npm run build

The generated production files are served from the Vite build output.

The frontend production environment should contain:

VITE_API_URL=https://meritconnect-1.onrender.com

After changing a Vite environment variable, trigger a new frontend deployment because environment variables are embedded during the build.

🖥️ Backend — Render

The backend is deployed as a Render web service.

Typical configuration:

Root Directory:
server

Build Command:
npm install

Start Command:
npm start

The backend must listen on the port supplied by Render:

process.env.PORT

The server should not hardcode a production-only port.

🗄️ MongoDB Atlas

MongoDB Atlas is used as the production database.

The backend connects using:

MONGODB_URI=...

The Render server's network access must be permitted by MongoDB Atlas.

For local development, the developer's current IP/network must also be permitted.

🔐 Production Security Checklist

Before production deployment:

 Never commit .env
 Rotate exposed API keys immediately
 Use strong JWT secrets
 Configure production CORS
 Restrict MongoDB Atlas network access appropriately
 Use HTTPS
 Configure Cloudinary securely
 Configure Gemini API key securely
 Review rate limits
 Review authentication cookies/tokens
 Remove development/debug endpoints
 Review Swagger exposure
 Review logs for sensitive information
📊 Project Capabilities
Capability	Technology
Frontend	React + TypeScript
Build Tool	Vite
Styling	Tailwind CSS
Backend	Node.js + Express
Database	MongoDB Atlas
ODM	Mongoose
Authentication	JWT
AI	Google Gemini
File Storage	Cloudinary
Real-Time	Socket.IO
API Documentation	Swagger/OpenAPI
Testing	Jest + Supertest
Frontend Deployment	Netlify
Backend Deployment	Render
🧭 Product Vision

MeritConnect aims to become a unified career platform where candidates do not need to use separate tools for every part of their job search.

Instead:

                 MERITCONNECT
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ↓             ↓             ↓
    Discover       Prepare       Manage
        │             │             │
        ↓             ↓             ↓
   AI Job Finder  AI Interview  Applications
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ↓
              Government Careers
                      │
                      ↓
             Career Opportunities

The long-term objective is to provide candidates with a single career workspace covering:

Discovery → Preparation → Application → Interview → Outcome

🎯 Future Roadmap

Potential future improvements include:

More government recruitment providers
Better job recommendation algorithms
Advanced resume analysis
Personalized interview plans
Interview performance history
Application reminders
Deadline notifications
Email notifications
Recruiter analytics
Candidate analytics
Advanced search
Job alerts
AI career recommendations
Skill-gap analysis
Learning recommendations
Automated application-draft generation
Calendar integration
More real-time interview capabilities
⚠️ Disclaimer

MeritConnect is a recruitment and career-assistance platform.

AI-generated recommendations and match scores should be treated as decision-support information, not guaranteed hiring or eligibility decisions.

For government recruitment:

The official recruitment notification and official application portal are authoritative.

Candidates should verify:

Eligibility
Age limits
Qualifications
Vacancies
Application dates
Fees
Examination dates
Reservation requirements
Other recruitment conditions

before applying.

MeritConnect does not automatically submit government applications on behalf of candidates.

🤝 Contributing

Contributions are welcome.

1. Fork the repository
git fork
2. Clone the repository
git clone https://github.com/RakeshSinghDev/Meritconnect.git
3. Create a branch
git checkout -b feature/your-feature
4. Make your changes

Follow the existing project architecture.

5. Test
npm test

and:

npm run build
6. Commit
git commit -m "Add your feature"
7. Push
git push origin feature/your-feature
8. Open a Pull Request
👨‍💻 Author

Rakesh Singh

GitHub:

https://github.com/RakeshSinghDev

⭐ Why MeritConnect?

Traditional job platforms primarily focus on listing jobs.

MeritConnect aims to go further:

Traditional Platform

Find Job
   ↓
Apply

MeritConnect:

Understand Candidate
        ↓
Discover Opportunities
        ↓
Match Jobs
        ↓
Prepare With AI
        ↓
Track Applications
        ↓
Prepare For Interviews
        ↓
Improve Career Decisions

The goal is not simply to provide another job board.

The goal is to build an AI-assisted career operating system for candidates and recruiters.

📌 Project Status

MeritConnect is an actively developed full-stack project.

Current platform areas include:

Candidate authentication
Recruiter workflows
Job management
Application management
Resume management
AI job discovery
AI resume/job matching
AI interview system
Interview management
Notifications
Activity tracking
Government career opportunities
Real-time interview infrastructure
