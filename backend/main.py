
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.pdf_router import router as pdf_router
from routers.chat_router import router as chat_router

app = FastAPI(
    title="Intelligent Learning Assistant API",
    description="Backend API for the RAG-based learning assistant",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(pdf_router)
app.include_router(chat_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Intelligent Learning Assistant API",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy"
    }
