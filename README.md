# ScreenShare App

A real-time screen sharing application built with React, Convex, and WebRTC. Share your screen with multiple participants, chat in real-time, and exchange files seamlessly.

## Features

- 🖥️ **Screen Sharing**: Share your screen with other participants using WebRTC
- 💬 **Real-time Chat**: Chat with participants in real-time
- 📁 **File Sharing**: Upload and share files with room participants
- 👥 **Multi-participant Support**: Support for multiple viewers per room
- 🔐 **Authentication**: Secure user authentication with Convex Auth
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database and functions)
- **Authentication**: Convex Auth
- **Real-time Communication**: WebRTC for screen sharing
- **File Storage**: Convex file storage
- **UI Components**: Custom components with Tailwind CSS
- **Notifications**: Sonner for toast notifications

## Prerequisites

- Node.js 18+ 
- npm or yarn
- A Convex account (free at [convex.dev](https://convex.dev))

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd screenshare-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Convex

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Install Convex CLI globally:
   ```bash
   npm install -g convex
   ```
3. Initialize Convex in your project:
   ```bash
   npx convex dev
   ```
4. Follow the prompts to create a new Convex project or connect to an existing one

### 4. Environment Setup

The app uses Convex for backend services, so no additional environment variables are needed for basic functionality.

### 5. Run the Application

Start both the frontend and backend:

```bash
npm run dev
```

This will:
- Start the Vite development server on `http://localhost:5173`
- Start the Convex backend in development mode
- Open your browser automatically

## Usage

### Creating a Room

1. Sign in with your credentials
2. On the dashboard, enter a room name
3. Click "Create Room"
4. You'll be automatically joined as the host

### Joining a Room

1. Sign in with your credentials
2. On the dashboard, find the room you want to join
3. Click "Join" on the room card

### Screen Sharing

1. In a room, go to the "Screen Share" tab
2. Click "Start Sharing"
3. Select the screen/window you want to share
4. Other participants will see your shared screen in real-time

### Chat

1. Go to the "Chat" tab in any room
2. Type your message and press Enter or click "Send"
3. Messages appear in real-time for all participants

### File Sharing

1. Go to the "Files" tab in any room
2. Drag and drop files or click "Choose Files"
3. Files are uploaded and shared with all participants
4. Click "Download" to download shared files

## Project Structure

```
├── convex/                 # Backend functions and schema
│   ├── schema.ts          # Database schema
│   ├── rooms.ts           # Room management functions
│   ├── messages.ts        # Chat and file messaging
│   ├── signaling.ts       # WebRTC signaling functions
│   └── auth.ts            # Authentication configuration
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   ├── Room.tsx       # Room interface
│   │   ├── ScreenShare.tsx # Screen sharing component
│   │   ├── Chat.tsx       # Chat component
│   │   ├── FileShare.tsx  # File sharing component
│   │   └── ParticipantsList.tsx # Participants display
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
└── README.md
```

## Key Components

### ScreenShare Component
- Handles WebRTC peer connections
- Manages screen capture and sharing
- Processes signaling messages for connection establishment

### Chat Component
- Real-time messaging between participants
- Message history and user identification
- File message display with download links

### FileShare Component
- Drag-and-drop file upload
- File storage using Convex storage
- File sharing with download capabilities

## Database Schema

The app uses the following main tables:

- **rooms**: Room information and settings
- **participants**: User participation in rooms
- **messages**: Chat messages and file sharing records
- **signaling**: WebRTC signaling data for peer connections

## WebRTC Implementation

The screen sharing uses WebRTC with the following flow:

1. Host creates an offer when starting screen share
2. Viewers receive the offer and create answers
3. ICE candidates are exchanged for connection establishment
4. Media streams are shared peer-to-peer

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up your Convex production deployment:
   ```bash
   npx convex deploy
   ```
4. Update your Convex configuration for production

### Deploy to Netlify

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to Netlify
3. Set up your Convex production deployment

## Troubleshooting

### Screen Sharing Not Working

- Ensure you're using HTTPS (required for screen sharing)
- Check browser permissions for screen sharing
- Verify WebRTC is supported in your browser

### Connection Issues

- Check your internet connection
- Ensure firewall isn't blocking WebRTC connections
- Try refreshing the page and rejoining the room

### File Upload Issues

- Check file size limits (Convex has a 1MB limit per file)
- Ensure you have proper permissions
- Verify your internet connection

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the Convex documentation at [docs.convex.dev](https://docs.convex.dev)
3. Open an issue in this repository

## Acknowledgments

- Built with [Convex](https://convex.dev) for real-time backend
- Uses [WebRTC](https://webrtc.org/) for peer-to-peer screen sharing
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Toast notifications by [Sonner](https://sonner.emilkowal.ski/)
