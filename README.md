# MoneyMind Pro - Financial Reports Dashboard

## Overview

MoneyMind Pro is a comprehensive financial reports dashboard web application that allows users to upload financial data files, process them through AWS services, and display interactive financial analytics. The application features a professional financial dashboard interface with modern design and functionality.

## Features

- **Modern UI**: Clean, professional design with dark blue sidebar and light main content area
- **Multi-tab Navigation**: Home, Dashboard, Credit Reports, Analytics, Reports
- **File Upload**: Drag-and-drop file upload with support for PDF, JSON, Excel, and CSV formats
- **Financial Dashboard**: Interactive financial ratios table with filtering and sorting
- **AWS Integration**: Backend processing using AWS services (S3, Lambda, API Gateway, DynamoDB)
- **Responsive Design**: Works on all device sizes

## Technology Stack

- **Frontend**:
  - React with TypeScript
  - Redux Toolkit for state management
  - React Query for API state
  - React Router for navigation
  - Tailwind CSS for styling
  - Chart.js for data visualization

- **Backend Integration**:
  - AWS API Gateway endpoints
  - S3 for file storage
  - Lambda for processing
  - DynamoDB for data persistence

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/moneymind-pro.git
   cd moneymind-pro
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Project Structure
