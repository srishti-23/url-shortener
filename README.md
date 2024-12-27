# URL Shortener 

To view the project-https://url-shortener-iv7h.onrender.com<br>
To view the detail api documentation-https://documenter.getpostman.com/view/39846401/2sAYJ4jgmb

This repository contains the backend for a URL Shortener application. It is designed to provide efficient and reliable services for shortening long URLs and redirecting users to the original links. Built with scalability and ease of use in mind, this project utilizes modern backend technologies.

---

## Features

- **URL Shortening**: Convert long URLs into shorter, easy-to-share links.
- **Redirection**: Redirect users from shortened URLs to the original URLs.
- **Custom Aliases**: Option to create custom aliases for URLs.
- **Analytics**: Track click counts and other statistics for each shortened URL.


---

## Tech Stack

- **Node.js**: Runtime environment for server-side development.
- **Express.js**: Web framework for building the API.
- **MongoDB**: Database for storing URLs and related data.
- **Mongoose**: ODM for MongoDB.
- **ShortID**: Library for generating unique IDs.

---

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v14 or above)
- **MongoDB** (locally or via a cloud provider like MongoDB Atlas)

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/url-shortener.git
   cd url-shortener
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:

   ```env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   BASE_URL=http://localhost:8000
   ```

4. Start the server:

   ```bash
   npm start
   ```

---

## API Endpoints

### 1. **POST /api/shorten**

- **Description**: Shortens a given URL.
- **Request Body**:
  ```json
  {
    "longUrl": "https://example.com/very-long-url",
    "customAlias": "optional-alias",
     "topic":"topicName"
  }
  ```
- **Response**:
  ```json
  {
    "shortID": "http://localhost:3000/abc123",
    "longUrl": "https://example.com/very-long-url",
    "alias": "abc123"
  }
  ```

### 2. **GET /:alias**

- **Description**: Redirects to the original URL associated with the alias.
- **Response**: HTTP 301 Redirect to the original URL.

### 3. **GET /api/stats/:alias**

- **Description**: Retrieves analytics data for a given alias.
- **Response**:
  ```json
  {
    "alias": "abc123",
    "longUrl": "https://example.com/very-long-url",
    "clicks": 42
  }
  ```

---

## Folder Structure

```
url-shortener-backend/
├── controllers/       # Business logic for API endpoints
├── models/            # Mongoose schemas and models
├── routes/            # API route definitions
├── utils/             # Utility functions (e.g., validation)
├── .env               # Environment variables
├── index.js          # Main server file
├── package.json       # Project metadata and dependencies
└── README.md          # Project documentation






