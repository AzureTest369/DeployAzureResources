# DeployAzureResources

A web application for deploying Azure resources through a user-friendly interface.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Server

To start the server, run:

```bash
npm start
```

Or directly:
```bash
node server.js
```

The server will start on port 3000 by default (or the PORT environment variable if set).

Once running, you can access:
- Main UI: http://localhost:3000/
- Parameters API: http://localhost:3000/params
- Deploy API: http://localhost:3000/deploy (POST)

## Configuration

The server uses hard-coded GitHub configuration values in `server.js`. Before deploying to production, make sure to:
1. Replace the GitHub token with your own
2. Update the GitHub owner and repository names
3. Configure the workflow file and branch reference

## Features

- Displays Azure deployment template parameters
- Triggers GitHub Actions workflows to deploy Azure resources
- Serves a static web UI from the `public` directory
