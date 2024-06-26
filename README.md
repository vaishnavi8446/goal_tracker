## Goal Setting and Habit Tracking Module - Backend
                                                                                  

## Introduction:
The Goal Setting and Habit Tracking Module backend provides the server-side functionality for managing user accounts, goals, tasks, and user activity logs. 

## Technologies Used: 
  
  - Node.js: A JavaScript runtime environment for executing server-side code.
  - Express.js: A web application framework for Node.js, providing features for building APIs and handling HTTP requests.
  - MongoDB: A NoSQL database used for storing user data, goals, tasks, and activity logs.
  - Mongoose: An Object Data Modeling (ODM) library for MongoDB, providing a schema-based solution for data validation and modeling.
  - JWT (JSON Web Tokens): A standard for securely transmitting information between parties as a JSON object.

    
## Database Design:
The backend utilizes a MongoDB database to store user data, goals, tasks, and user activity logs. Here's the database schema:

            1. User Collection:
            
            _id (ObjectID)
            username (String)
            email (String)
            password (String)
            
            2. Goal Collection:
            
            _id (ObjectID)
            userId (ObjectID referencing User)
            goalName (String)
            minTimeline (Date)
            maxTimeline (Date)
            
            3. Task Collection:
            
            _id (ObjectID)
            goalId (ObjectID referencing Goal)
            taskName (String)
            quantity (Number)
            frequency (String) // "daily", "twice_daily", "weekly"
            daysOfWeek (Array) // [0, 1, 2, 3, 4, 5, 6] for Sunday to Saturday
            reminders (Array of Date)
            
            4. UserLog Collection:
            
            _id (ObjectID)
            userId (ObjectID referencing User)
            goalId (ObjectID referencing Goal)
            taskId (ObjectID referencing Task)
            logDate (Date)
            quantityCompleted (Number)

## Architecture:

  The backend follows a RESTful architecture with Node.js and Express.js framework. Here's the architectural overview:

  - Node.js with Express.js: Handles HTTP requests and responses, routing, middleware, and error handling.
  - Mongoose: Serves as an Object Data Modeling (ODM) library for MongoDB, providing schema-based solutions and validation.
  - JWT (JSON Web Tokens): Used for user authentication and authorization, generating and verifying tokens for secure access to protected routes.

## Getting Started:

Install dependencies => npm install

Start the server => npm start

## Conclusion:

The Goal Setting and Habit Tracking Module provides users with a comprehensive toolset to set, track, and achieve their goals and habits effectively. This technical design document serves as a guide for the development and implementation of the module, ensuring scalability, reliability, and maintainability throughout the development process.

## Postman Collection is also included in the GitHub code base.
