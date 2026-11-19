# 🎓 LearnAI – Academic Companion

### RAG-Based Intelligent Learning Assistant for Interactive Textbooks and Automated Lesson Plan Generation

LearnAI is an AI-powered educational application that uses **Retrieval-Augmented Generation (RAG)** to make learning easier, smarter and more interactive.

Students can upload PDF textbooks, ask questions based on their learning materials, and receive context-aware answers. The application also helps students generate study guides, flashcards, quizzes and structured lesson plans.

---

## 🚀 Key Features

- **Interactive Textbook Assistant:** Upload PDF textbooks and interact with their content.
- **Intelligent Question Answering:** Ask questions and receive understandable, context-aware answers.
- **Source-Based Responses:** Retrieve relevant information from uploaded learning materials.
- **Study Guide Generator:** Generate organized study notes.
- **Flashcard Generator:** Create question-and-answer flashcards for revision.
- **Quiz Generator:** Generate educational questions to test understanding.
- **Automated Lesson Planner:** Generate structured lesson plans.
- **Conversation History:** Support contextual follow-up questions.
- **PDF Management:** Upload, organize, select and delete textbook documents.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Frontend Build Tool | Vite |
| Backend | Python |
| Backend Framework | FastAPI |
| PDF Processing | PyMuPDF |
| Text Chunking | LangChain Text Splitters |
| AI Integration | Nexus API |
| API Client | OpenAI-compatible Python client |
| Version Control | Git and GitHub |

---

## 🏗️ Project Architecture

```text
LearnAI-Academic-Companion/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── assets/
│       ├── App.jsx
│       └── App.css
│
├── backend/
│   ├── routers/
│   │   ├── chat_router.py
│   │   └── pdf_router.py
│   │
│   ├── services/
│   │   ├── pdf_service.py
│   │   ├── chunking_service.py
│   │   ├── retrieval_service.py
│   │   └── nexus_service.py
│   │
│   ├── uploads/
│   ├── main.py
│   └── requirements.txt
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 🔄 How RAG Works in LearnAI

LearnAI uses Retrieval-Augmented Generation to answer questions using uploaded educational documents.

### Document Processing

1. Students upload PDF textbooks.
2. PyMuPDF extracts text from PDF documents.
3. LangChain Text Splitters divide extracted text into smaller chunks.
4. Document chunks and metadata are stored for retrieval.

### Question Answering

1. Students submit questions through the React frontend.
2. FastAPI receives the request.
3. The retrieval service searches for relevant textbook content.
4. Retrieved information is added to the AI prompt as context.
5. The Nexus AI API generates an answer.
6. The frontend displays the generated response and available sources.

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- Python 3.12 (recommended)
- Node.js 22
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Hemasri-Annachandar/LearnAI-Academic-Companion.git
```

```bash
cd LearnAI-Academic-Companion
```

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a Python virtual environment:

```bash
py -3.12 -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend folder.

Add your authorized Nexus API configuration:

```env
NEXUS_API_KEY=your_authorized_api_key
NEXUS_BASE_URL=https://nexusapi.navigatelabs.ai
NEXUS_MODEL=nova-micro
```

**Important:** Never upload your actual API key or `.env` file to GitHub.

### 4. Start the Backend

```bash
python -m uvicorn main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 5. Frontend Setup

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

`http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/pdfs/upload` | Upload PDF documents |
| POST | `/api/chat/` | Send questions to the AI assistant |
| DELETE | `/api/pdfs/{file_id}` | Delete uploaded PDF documents |

---

## 🎯 Project Objectives

- Make textbook learning more interactive.
- Reduce the time spent searching lengthy educational documents.
- Provide context-aware AI-powered question answering.
- Simplify complex educational concepts.
- Automate the generation of study materials.
- Support teachers with AI-assisted lesson planning.

---

## 🔮 Future Enhancements

- Vector database integration for semantic retrieval.
- Improved retrieval relevance and ranking.
- Advanced page-level source citations.
- Export study guides and lesson plans as PDF.
- Student learning progress tracking.
- Difficulty-based explanations.
- Teacher and student role management.
- Deployment for wider accessibility.

---

## 👨‍💻 Development

This project was developed using React.js, Python FastAPI, document processing tools and an AI API.

**Project Name:** LearnAI – Academic Companion

**Project Type:** RAG-Based Intelligent Learning Assistant

**Domain:** Artificial Intelligence and Education Technology

---

## 📄 License

No open-source license has been specified yet. All rights reserved unless the repository owner adds a license.