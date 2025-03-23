Template for Prisma, Express, React, and Bun
============================================

This template provides a comprehensive starting point for building full-stack applications with **Prisma**, **Express**, **React**, and **Bun**. It comes pre-configured with all the necessary setup for these technologies, allowing you to focus on development right away.

Technologies
------------

*   **Prisma**: An ORM (Object-Relational Mapper) for interacting with your database.
    
*   **Express**: A minimal and flexible Node.js web application framework.
    
*   **React**: A JavaScript library for building user interfaces, with Vite as the bundler.
    
*   **Bun**: A fast JavaScript bundler, transpiler, and package manager.
    
*   **React Router**: A library for managing navigation in React applications.
    
*   **HTTPS**: Web protocol for securing traffic.
    
*   **Tailwind CSS**: A utility-first CSS framework for building custom designs quickly.

Project Structure
-----------------

```
.
├── bun.lockb
├── eslint.config.js
├── index.html
├── LICENSE
├── package.json
├── public
├── README.md
├── server
│   ├── certs
│   │   ├── server.crt
│   │   └── server.key
│   ├── index.ts
│   ├── prisma
│   │   └── schema.prisma
│   ├── src
│   │   ├── api
│   │   │   ├── middleware
│   │   │   └── routes
│   │   ├── libs
│   │   │   └── prisma.ts
│   │   └── utils
│   │       ├── old.routeLoader.ts
│   │       └── routeLoader.ts
│   └── tests
│       └── index.test.ts
├── src
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.server.json
└── vite.config.ts

13 directories, 23 files
```

Getting Started
---------------

### Prerequisites

Before getting started, ensure that you have [Bun](https://bun.sh) installed on your machine. You can install it via:

```bash
curl -fsSL https://bun.sh/install | bash # For macOS, Linux, and WSL
```

### Installation

1.  **Create your repository:**
    
    *   Click the `Use this template` button at the top of the repository page.
        
    *   Select `Create a new repository` and follow the prompts to create your repo.
        
2.  **Clone your repository:**
    
    ```bash
    git clone https://github.com/PinkQween/PERB.git <Project Name>
    cd <Project Name>
    ```
    
3.  **Install dependencies using Bun:**
    
    ```bash
    bun install
    ```
    
4.  **Set up the database, environment, and certificates:**
    
    *   Modify the `schema.prisma` file to define your Prisma models.
        
    *   In the `.env` file, set your `DATABASE_URL` to point to your PostgreSQL (or other) database.
        
    *   Run the following to apply migrations:
        
    
    ```bash
    bunx prisma migrate dev --name init
    ```
    
    *   Add your SSL certificates in `/server/certs` (recommended: Cloudflare).
        
5.  **Run the development server:**
    
    To run both the backend (Express) and frontend (React), use the following commands:
    
    *   **Backend (Express server):**
        
        ```bash
        bun run server-dev
        ```
        
    *   **Frontend (React development server):**
        
        ```bash
        bun run dev
        ```
        
    
    You can now access the frontend at `http://localhost:5173` and the backend API at `https://localhost:443`.
    
6.  **Code your project!**
    
7.  **Prepare for production:**
    
    Follow the steps further down in the README to configure your app for production.
    

### API Endpoints

Here are the default API endpoints:

*   **GET** `/api/okay`: Check server health
    

### Customizing the Template

You can customize the template to fit your needs:

*   **Prisma Schema**: Modify the `schema.prisma` file to define your database models.
    
*   **API Routes**: Add new routes by creating files in the `server/src/routes` directory.
    
*   **React Components**: Extend the frontend by adding new React components or libraries.
    

### Running Tests

To run tests, use:

```bash
bun test
```

### Development Setup

1.  **Set your production environment variables** in `.env`.
    
2.  **Run the Vite server without Express:**
    
    ```bash
    bun run dev
    ```
    
3.  **Run the backend server:**
    
    ```bash
    bun run run
    ```
    

### Deploying to Production

1.  **Set your production environment variables** in `.env`.
    
2.  **Build the React app for production:**
    
    ```bash
    bun run build
    ```
    
3.  **Run the backend server in production mode:**
    
    ```bash
    bun run server-dev
    ```
    

Contributing
------------

Feel free to open issues or submit pull requests if you find any bugs or wish to improve this template.

License
-------

This template is licensed under the MIT License. See the [LICENSE](https://github.com/PinkQween/PERB/blob/main/LICENSE) file for more details.

> "Making daily life easier."