# Arman Automation Website

This is the official website for Arman Automation, a service offering QA & HR Automation solutions.

## Features
- **Responsive Design**: Mobile-first layout using CSS Grid/Flexbox.
- **Backend API**: Node.js + Express server.
- **Database**: MongoDB integration for user management.
- **Email Notifications**: Automated emails via Nodemailer (Gmail).
- **Authentication**: Login and Signup functionality.

## Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)

## Installation

1.  **Clone the repository** (or download files):
    ```bash
    git clone <repository-url>
    cd arman-automation
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/arman_automation
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    ```
    > **Note**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your login password.

## Running the Application

1.  **Start MongoDB** (if running locally):
    ```bash
    mongod
    ```

2.  **Start the Server**:
    ```bash
    npm start
    ```

3.  **Access the Website**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Frontend + Backend)
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` and follow the prompts.
3.  Add Environment Variables in Vercel Dashboard.

### Render (Alternative)
1.  Connect your GitHub repo to Render.
2.  Select "Web Service".
3.  Set Build Command: `npm install`
4.  Set Start Command: `node server.js`
5.  Add Environment Variables in Render Settings.

## Project Structure
- `server.js`: Main backend server file.
- `models/`: Database schemas (User.js).
- `public/`: Static frontend files (HTML, CSS, JS).
- `.env`: Environment variables (Ignored by Git).
