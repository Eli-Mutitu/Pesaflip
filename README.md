# Pesaflip 3.0

Pesaflip is a modern financial management platform built with Next.js, designed to help businesses manage their invoices, payments, and financial operations efficiently.

## 🌟 Features

- **Invoice Management**
  - Create and manage invoices
  - AI-powered invoice suggestions
  - Automated invoice reminders
  - Customizable payment terms

- **Wallet & Payments**
  - Secure wallet management
  - Multiple payment methods
  - Transaction history
  - Real-time balance updates

- **Dashboard & Analytics**
  - Financial overview
  - Expense tracking
  - Revenue analytics
  - Custom reports

- **User Management**
  - Secure authentication
  - Role-based access control
  - Profile management
  - Business profile settings

## 🚀 Tech Stack

- **Frontend**
  - Next.js 15.3
  - React 19
  - TailwindCSS
  - Radix UI Components
  - Framer Motion

- **Backend**
  - Next.js API Routes
  - Oracle Database
  - JWT Authentication
  - OpenAI Integration

- **Development Tools**
  - TypeScript
  - ESLint
  - Turbopack
  - Tailwind CSS

## 📋 Prerequisites

- Node.js (Latest LTS version)
- Oracle Database
- OpenAI API Key
- Email Service Account

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Eli-Mutitu/Pesaflip.git
   cd Pesaflip
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL=your_oracle_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   EMAIL_SERVICE_KEY=your_email_service_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
pesaflip/
├── app/                 # Next.js app directory
├── components/         # Reusable UI components
├── lib/               # Utility functions and configurations
├── services/          # Business logic and API services
├── pages/             # API routes and pages
├── public/            # Static assets
├── scripts/           # Utility scripts
└── types/             # TypeScript type definitions
```

## 🚀 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Secure API endpoints
- Environment variable protection

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email eliforestdev@gmail.com or open an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Radix UI for the accessible components
- OpenAI for the AI capabilities
- All contributors who have helped shape this project 