📸 Obscura Backend - A Photo Vault Backend API

A robust backend REST API for a Photo Vault application that allows users to securely upload, manage, and organize photos. The system supports authentication, role-based access control, cloud image storage, caching, and abuse prevention mechanisms.

🚀 Features

User Authentication & Authorization

User registration and login

JWT-based authentication

Role-based access control (User, Admin, guest)

Photo Management

Upload photos with title, description, and visibility (public/private)

Private photos accessible only by the owner

Public photos viewable by all users

Photo deletion by owner or admin (moderation)

Albums

Create, update, and delete albums

Organize photos into albums

Cloud Storage

Image storage via AWS S3 or Cloudinary

Secure handling of uploaded files

Performance & Security

Redis caching for frequently accessed data

Rate limiting to prevent abuse

Input validation and error handling

🛠️ Tech Stack

Backend: Node.js, Express.js

Database: MongoDB (Mongoose) 

Authentication: JWT

Cloud Storage: Cloudinary

Caching: Redis

Security: Helmet, Rate Limiting, RBAC

Environment Management: dotenv.