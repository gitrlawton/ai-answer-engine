# AI Answer Engine

## Overview

This project is a web application that allows uers to ask questions about the text content of a provided webpage url. This AI Answer Engine provides a chat interface for users to interact with an AI assistant and utilizes Groq for generating responses based on user input as well as Puppeteer for scraping content from URLs.

## Features

- **Chat Interface**: Users can send messages to the AI assistant and receive responses in real-time.
- **Web Scraping**: The application extracts URLs from user messages and scrapes relevant content to provide context for the AI's responses.
- **Token Management**: The application includes a utility function to truncate text responses to ensure they fit within specified limits.
- **Rate Limiting**: Middleware is implemented to manage the number of requests to the API, preventing abuse and ensuring fair usage.

## Installation

To set up the project, ensure you have Node.js installed on your machine. Then, follow these steps:

1. Clone the repository:

   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the required packages:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add your Groq API key:

   ```plaintext
   GROQ_API_KEY=your_groq_api_key
   ```

## Usage

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your web browser and navigate to `http://localhost:3000` to access the chat interface.

3. Type your message in the input field and press "Enter" or click "Send" to interact with the AI assistant. Make sure to include a URL in your message.

4. The AI will generate its response based on the contents of the webpage located at the provided URL.

## File Descriptions

- **src/app/api/chat/route.ts**: Contains the API logic for handling chat requests, including message processing, URL extraction, and web scraping.
- **src/app/page.tsx**: The main React component for rendering the chat interface and managing user interactions.
- **src/app/layout.tsx**: Defines the layout structure of the application, including global styles and font settings.
- **src/middleware.ts**: Implements rate limiting for the API to control the number of requests from users.

## Dependencies

- **Next.js**: A React framework for building server-side rendered applications.
- **Puppeteer**: A library for controlling headless Chrome or Chromium, used for web scraping.
- **Groq SDK**: A client for interacting with the Groq API to generate AI responses.
- **@upstash/ratelimit**: A library for implementing rate limiting in the application.
- **@upstash/redis**: A Redis client for managing rate limiting data.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.
