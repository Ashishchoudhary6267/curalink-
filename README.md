# CuraLink - Medical Research Engine

A modern medical research platform that leverages AI and multiple data sources to provide comprehensive research insights on diseases, treatments, clinical trials, and academic publications.

## 🎯 Overview

CuraLink is a full-stack web application that combines machine learning, natural language processing, and medical data aggregation to help researchers, healthcare professionals, and patients find relevant medical information quickly and accurately.

## ✨ Features

### Core Features
- 🔍 **Intelligent Query Expansion** - AI-powered query enhancement for better search results
- 📚 **Multi-Source Data Retrieval** - Aggregates data from:
  - Clinical Trials (clinicaltrials.gov)
  - PubMed (Medical research papers)
  - OpenAlex (Academic publications)
- 🤖 **LLM-Powered Synthesis** - Generates comprehensive, structured responses using advanced language models
- 📊 **Smart Result Ranking** - Ranks results by recency, relevance, and credibility
- 🔐 **Secure Authentication** - MongoDB-based user authentication with bcrypt password hashing
- 💾 **Search History** - Stores and retrieves past research sessions
- 🌙 **Dark/Light Mode** - Customizable theme preference

### User Experience
- 👤 **Patient Context** - Set disease context, patient name, and location for personalized results
- 🏥 **Source Citations** - See detailed sources with titles, authors, years, and direct links
- 📈 **Pipeline Progress Tracking** - Visual feedback on data retrieval stages
- 🔌 **Dual Backend Support** - Switch between local development and remote deployed servers

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Axios** - HTTP client
- **CSS3** - Styling with glassmorphism design

### Backend
- **FastAPI** - Python web framework
- **MongoDB** - NoSQL database for user data
- **PyMongo** - MongoDB driver
- **Bcrypt** - Password hashing
- **PyJWT** - JWT token generation
- **Python Dotenv** - Environment variable management

### External APIs
- **HuggingFace** - LLM models
- **Groq** - Fast LLM inference
- **ClinicalTrials.gov API** - Clinical trial data
- **PubMed API** - Medical research papers
- **OpenAlex API** - Academic publications

## 📦 Project Structure

```
curalink/
├── backend-ai/
│   ├── main.py                 # FastAPI application with auth endpoints
│   ├── requirements.txt        # Python dependencies
│   ├── run.bat                 # Start backend (Windows)
│   ├── .env                    # Environment variables
│   ├── services/
│   │   ├── auth.py             # Password hashing & JWT token logic
│   │   ├── database.py         # MongoDB connection
│   │   ├── query_engine.py     # Query expansion
│   │   ├── clinical_trials.py  # ClinicalTrials.gov API
│   │   ├── pubmed.py           # PubMed API
│   │   ├── openalex.py         # OpenAlex API
│   │   └── llm_engine.py       # LLM response generation
│   └── venv/                   # Python virtual environment
│
└── frontend/
    ├── src/
    │   ├── App.jsx             # Main app component
    │   ├── main.jsx            # React entry point
    │   ├── context/
    │   │   └── AuthContext.jsx  # Authentication state management
    │   ├── components/
    │   │   ├── Login.jsx        # Sign in/Sign up form
    │   │   ├── Sidebar.jsx      # Navigation & session history
    │   │   ├── InputArea.jsx    # Query input with backend toggle
    │   │   ├── ChatHistory.jsx  # Response display
    │   │   ├── ContextPanel.jsx # Patient info & sources
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   └── Research.jsx     # Main research page
    │   ├── styles/
    │   │   └── Login.css        # Authentication styling
    │   └── assets/
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.10+
- MongoDB Atlas account (free tier available)
- API keys:
  - HuggingFace API key
  - Groq API key

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend-ai
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (`.env` file):
   ```
   HUGGINGFACE_API_KEY=your_huggingface_key
   GROQ_API_KEY=your_groq_key
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/curalink?retryWrites=true&w=majority
   SECRET_KEY=your-secret-jwt-key
   ```

5. **Get MongoDB Connection String:**
   - Create MongoDB Atlas cluster (free at https://www.mongodb.com/cloud/atlas)
   - Click "Connect" → "Drivers" → Copy connection string
   - Replace `<username>:<password>` with your database credentials

6. **Start backend:**
   ```bash
   python -m uvicorn main:app --reload
   ```
   Backend runs on: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

## 🔐 Authentication

### Signup Flow
1. User creates account with email and password (6+ characters)
2. Password is hashed using bcrypt before storing in MongoDB
3. Account confirmation required - user must sign in manually
4. JWT token issued on successful login

### Database Schema
```javascript
users collection:
{
  _id: ObjectId,
  email: "user@example.com",
  password: "hashed_bcrypt_password",
  created_at: ISODate
}
```

## 📡 API Endpoints

### Authentication
- `POST /api/signup` - Register new user
  - Body: `{ email, password, confirmPassword }`
  - Response: `{ success, token, user }`

- `POST /api/login` - Sign in user
  - Body: `{ email, password }`
  - Response: `{ success, token, user }`

### Research
- `POST /api/research` - Retrieve medical research data
  - Body: `{ query, disease, location }`
  - Response: `{ status, structured_response, sources_used }`

## 🔄 Data Pipeline

1. **Query Expansion** - AI enhances user query with medical context
2. **Parallel Retrieval** - Fetches from 3 data sources simultaneously
3. **Result Ranking** - Scores based on:
   - Keyword relevance
   - Publication recency
   - Clinical trial status
4. **LLM Synthesis** - Generates structured medical response
5. **Source Attribution** - Returns top 8 results with citations

## 🌐 Deployment

### Backend (Render)
```bash
# Build: pip install -r requirements.txt
# Start: uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

## 📝 Environment Variables Reference

**Backend (.env):**
```
HUGGINGFACE_API_KEY=hf_xxxxx
GROQ_API_KEY=gsk_xxxxx
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/curalink
SECRET_KEY=your-secret-key
```

## 🔐 Security Best Practices

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens with 24-hour expiration
- ✅ MongoDB connection with authentication
- ✅ Environment variables for sensitive data
- ✅ CORS enabled for frontend access
- ✅ Input validation on signup/login

## 🐛 Troubleshooting

### Backend connection fails
- Verify `.env` has correct MongoDB connection string
- Check MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0)
- Ensure all Python packages installed: `pip install -r requirements.txt`

### Login always succeeds
- Backend must be running on `http://localhost:8000`
- Check MongoDB connection is active
- Clear browser localStorage and try again

### API calls timeout
- Increase timeout in `InputArea.jsx` (default: 30s)
- Check internet connection to external APIs
- Verify API keys are valid and have quota

## 📚 Learning Resources

- FastAPI Docs: https://fastapi.tiangolo.com
- MongoDB Docs: https://docs.mongodb.com
- React Docs: https://react.dev
- Vite Guide: https://vitejs.dev

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## ✉️ Contact & Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for medical research**
