# Permitron: AI-Powered Task Management with Fine-Grained Permissions

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Permitron is an intelligent task management application that combines the power of LLM-based chatbots with Permit.io's robust permission management system. It enables users to create, update, and manage tasks through natural language conversations while enforcing fine-grained permission controls based on user roles and context.

![Board View](project/src/BoardVuew.png)

## ✨ Features

- **Natural Language Task Management**
  - Create tasks conversationally: "Create a task for adding new feature"
  - Update tasks: "Update task #123 with title: Improved API integration"
  - Change task status: "Move task #123 to in-progress"
  - Delete tasks: "Delete task #123"
  - List and filter tasks: "Show me my in-progress tasks"

- **Kanban Board Visualization**
  - Visual task board with draggable cards
  - Columns for Todo, In Progress, Review, and Done
  - Status updates sync between chat and board interfaces

- **Fine-Grained Permissions with Permit.io**
  - Role-based access control (Admin, Employee, Guest)
  - Attribute-based permissions (task ownership, assignment)
  - LLM operation authorization

- **Conversational Interface**
  - AI-powered chat assistant using OpenAI
  - Permission-aware responses
  - Context-aware task management

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- Vite for bundling and development
- Zustand for state management
- Tailwind CSS for styling

### Backend
- Node.js with Express.js
- OpenAI API for natural language processing
- Permit.io SDK for authorization
- JWT for authentication

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- Permit.io account and API key
- OpenAI API key

## 🚀 Getting Started

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Shaik-mohd-huzaifa/permitron.git
   cd permitron
   ```

2. Install dependencies for both frontend and backend
   ```
   # Root dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../project
   npm install
   ```

3. Set up environment variables

   Create a `.env` file in the backend directory:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_change_in_production
   PERMIT_API_KEY=your_permit_io_api_key
   PERMIT_ENV=dev
   PERMIT_PDP_URL=https://cloudpdp.api.permit.io
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start development servers

   In the root directory:
   ```
   # Run both frontend and backend
   npm run dev
   
   # Or run them separately
   npm run dev:frontend
   npm run dev:backend
   ```

## 🔒 Demo Credentials

The application comes with pre-configured demo users:

- **Admin User**
  - Email: admin@example.com
  - Password: admin123
  - Full access to all features

- **Employee User**
  - Email: employee@example.com
  - Password: employee123
  - Limited access based on ownership

> **Note:** These credentials are for demonstration purposes only. In a production environment, please implement proper authentication and security measures.

## 📖 How to Use

### Task Management
1. Log in with one of the demo accounts
2. Navigate to the chat interface
3. Use natural language to create and manage tasks:
   - "Create a task for implementing the login page"
   - "Show all my tasks"
   - "Update task #1 with priority high"
   - "Move task #3 to done"

### Permission Testing
1. Log in with different user roles
2. Attempt actions with different permission levels
3. Notice how the system enforces permissions based on:
   - User role
   - Task ownership
   - Assigned tasks

## 🧩 Project Structure

```
permitron/
├── backend/               # Express.js backend
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── .env               # Backend environment variables
│   └── server.js          # Server entry point
│
├── project/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Zustand state stores
│   │   ├── types/         # TypeScript type definitions
│   │   └── main.tsx       # Frontend entry point
│   ├── .env.production    # Production environment variables
│   └── vite.config.ts     # Vite configuration
│
└── README.md              # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [Permit.io](https://permit.io) for the authorization framework
- [OpenAI](https://openai.com) for the language model API
- Built as part of the Permit.io Hackathon 2025
