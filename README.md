# Blog List Application

Welcome to the Blog List Application! This application allows users to save information about interesting blogs they have stumbled across on the internet. Users can store details such as the author, title, URL, and the number of upvotes for each blog.

## Features

- **Add a Blog**: Users can add a new blog to the list by providing the author's name, blog title, URL, and the number of upvotes.
- **View Blogs**: Users can view a list of all the blogs saved in the application.
- **View Specific Blog**: Users can view details of a specific blog by clicking on it from the list.
- **Delete Blog**: Users with the appropriate permissions can delete a blog from the list.

## Technologies Used

- **Node.js**: The backend of the application is built using Node.js, which allows for server-side JavaScript execution.
- **Express.js**: Express.js is used as the web application framework for Node.js, facilitating the handling of HTTP requests and routes.
- **MongoDB**: MongoDB serves as the database for storing blog information. It provides a flexible, schema-less data storage solution.
- **Mongoose**: Mongoose is used as an ODM (Object Data Modeling) library for MongoDB. It simplifies interactions with the database by providing a schema-based solution.
- **React**: The frontend of the application is built using React, a JavaScript library for building user interfaces.
- **Redux**: Redux is used for managing the application state in the frontend. It provides a predictable state container for JavaScript applications.
- **Axios**: Axios is used for making HTTP requests from the frontend to the backend API.

## Getting Started

To get started with the Blog List Application, follow these steps:

1. **Clone the Repository**: Clone the repository to your local machine using the following command:

   ```bash
   git clone git@github.com:ParisaKalaki/Blog-Application.git
   ```

2. **Install Dependencies**: Navigate to the project directory and install the required dependencies for both the backend and frontend:
   ```bash
   cd blog-list-app
   npm install
   npm run dev
   ```
