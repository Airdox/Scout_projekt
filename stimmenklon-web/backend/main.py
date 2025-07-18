from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import os
import uuid
import sqlite3
from datetime import datetime
import json
from typing import List, Optional
from pathlib import Path

# Lokale Verzeichnisse erstellen
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
MODELS_DIR = BASE_DIR / "voice_models"
OUTPUT_DIR = BASE_DIR / "output"

for dir_path in [UPLOAD_DIR, MODELS_DIR, OUTPUT_DIR]:
    dir_path.mkdir(exist_ok=True)

app = FastAPI(title="Offline Voice Cloning API", version="1.0.0")

# CORS für Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite Datenbank initialisieren
def init_db():
    conn = sqlite3.connect(BASE_DIR / "voice_cloning.db")
    cursor = conn.cursor()
    
    # Voice Models Tabelle
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS voice_models (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            audio_files TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            model_path TEXT,
            quality_score REAL DEFAULT 0.0
        )
    """)
    
    # TTS History Tabelle
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tts_history (
            id TEXT PRIMARY KEY,
            text TEXT NOT NULL,
            model_id TEXT,
            output_file TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()

# Datenbank initialisieren
init_db()

class WebTTSEngine:
    """Web-basierte TTS Engine als Fallback"""
    
    def __init__(self):
        self.available_voices = [
            {'id': '0', 'name': 'Standard Voice (Browser)', 'language': 'de-DE'},
            {'id': '1', 'name': 'English Voice (Browser)', 'language': 'en-US'},
            {'id': '2', 'name': 'French Voice (Browser)', 'language': 'fr-FR'},
        ]
    
    def get_available_voices(self):
        return self.available_voices
    
    def synthesize_text(self, text: str, voice_id: str = "0") -> str:
        """Erstellt eine Dummy-Audiodatei für Demo-Zwecke"""
        output_file = OUTPUT_DIR / f"tts_{uuid.uuid4().hex}.txt"
        
        # Demo: Text-Datei erstellen statt Audio
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"TTS Output:\nText: {text}\nVoice ID: {voice_id}\nGenerated at: {datetime.now()}")
        
        return str(output_file)

class SimpleVoiceCloner:
    """Einfaches Voice-Cloning für Demo"""
    
    @staticmethod
    def create_voice_model(audio_files: List[str], model_name: str) -> dict:
        try:
            model_id = str(uuid.uuid4())
            model_path = MODELS_DIR / f"{model_id}.json"
            
            # Model-Metadaten
            model_data = {
                'id': model_id,
                'name': model_name,
                'audio_files': audio_files,
                'quality_score': 0.8,  # Demo-Qualität
                'created_at': datetime.now().isoformat(),
                'audio_count': len(audio_files)
            }
            
            # Model speichern
            with open(model_path, 'w') as f:
                json.dump(model_data, f, indent=2)
            
            return model_data
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Voice-Model-Erstellung fehlgeschlagen: {str(e)}")

# TTS Engine initialisieren
tts_engine = WebTTSEngine()

@app.get("/")
async def root():
    return {
        "message": "Offline Voice Cloning API", 
        "version": "1.0.0", 
        "status": "Demo Mode - Web TTS",
        "features": ["Audio Upload", "Voice Model Creation", "Web-based TTS"]
    }

@app.get("/api/voices")
async def get_available_voices():
    return {
        "voices": tts_engine.get_available_voices(),
        "count": len(tts_engine.available_voices)
    }

@app.post("/api/upload-audio")
async def upload_audio(files: List[UploadFile] = File(...)):
    uploaded_files = []
    
    for file in files:
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail=f"Datei {file.filename} ist keine Audio-Datei")
        
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        save_path = UPLOAD_DIR / f"{file_id}{file_extension}"
        
        # Datei speichern
        content = await file.read()
        with open(save_path, 'wb') as f:
            f.write(content)
        
        # Geschätzte Dauer basierend auf Dateigröße
        file_size = len(content)
        estimated_duration = file_size / (44100 * 2)  # Grobe Schätzung
        
        uploaded_files.append({
            "id": file_id,
            "filename": file.filename,
            "path": str(save_path),
            "quality_score": 0.8,  # Demo-Qualität
            "duration": estimated_duration,
            "sample_rate": 44100
        })
    
    return {"uploaded_files": uploaded_files, "count": len(uploaded_files)}

@app.post("/api/create-voice-model")
async def create_voice_model(model_name: str, audio_file_paths: List[str]):
    if not model_name.strip():
        raise HTTPException(status_code=400, detail="Model-Name ist erforderlich")
    
    if len(audio_file_paths) < 1:
        raise HTTPException(status_code=400, detail="Mindestens eine Audio-Datei ist erforderlich")
    
    # Voice Model erstellen
    model_data = SimpleVoiceCloner.create_voice_model(audio_file_paths, model_name)
    
    # In Datenbank speichern
    conn = sqlite3.connect(BASE_DIR / "voice_cloning.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO voice_models (id, name, description, audio_files, model_path, quality_score)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        model_data['id'],
        model_name,
        f"Voice Model mit {model_data['audio_count']} Audio-Dateien",
        json.dumps(audio_file_paths),
        str(MODELS_DIR / f"{model_data['id']}.json"),
        model_data['quality_score']
    ))
    
    conn.commit()
    conn.close()
    
    return model_data

@app.get("/api/voice-models")
async def get_voice_models():
    conn = sqlite3.connect(BASE_DIR / "voice_cloning.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM voice_models ORDER BY created_at DESC")
    models = cursor.fetchall()
    conn.close()
    
    result = []
    for model in models:
        result.append({
            "id": model[0],
            "name": model[1],
            "description": model[2],
            "audio_files": json.loads(model[3]) if model[3] else [],
            "created_at": model[4],
            "model_path": model[5],
            "quality_score": model[6]
        })
    
    return {"models": result, "count": len(result)}

@app.post("/api/synthesize")
async def synthesize_text(text: str, voice_id: str = "0", model_id: Optional[str] = None):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text ist erforderlich")
    
    # Demo TTS
    output_file = tts_engine.synthesize_text(text, voice_id)
    
    # In Historie speichern
    history_id = str(uuid.uuid4())
    conn = sqlite3.connect(BASE_DIR / "voice_cloning.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO tts_history (id, text, model_id, output_file)
        VALUES (?, ?, ?, ?)
    """, (history_id, text, model_id, output_file))
    
    conn.commit()
    conn.close()
    
    return {
        "history_id": history_id,
        "output_file": output_file,
        "text": text,
        "voice_id": voice_id,
        "model_id": model_id,
        "note": "Demo Mode - Using Web Speech API in browser"
    }

@app.get("/api/audio/{filename}")
async def get_audio(filename: str):
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio-Datei nicht gefunden")
    
    return FileResponse(file_path, media_type="text/plain", filename=filename)

@app.get("/api/tts-history")
async def get_tts_history():
    conn = sqlite3.connect(BASE_DIR / "voice_cloning.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM tts_history ORDER BY created_at DESC LIMIT 50")
    history = cursor.fetchall()
    conn.close()
    
    result = []
    for item in history:
        result.append({
            "id": item[0],
            "text": item[1],
            "model_id": item[2],
            "output_file": item[3],
            "created_at": item[4]
        })
    
    return {"history": result, "count": len(result)}

@app.delete("/api/voice-models/{model_id}")
async def delete_voice_model(model_id: str):
    conn = sqlite3.connect(BASE_DIR / "voice_cloning.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT model_path FROM voice_models WHERE id = ?", (model_id,))
    result = cursor.fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Voice Model nicht gefunden")
    
    # Model-Datei löschen
    model_path = Path(result[0])
    if model_path.exists():
        model_path.unlink()
    
    cursor.execute("DELETE FROM voice_models WHERE id = ?", (model_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Voice Model erfolgreich gelöscht"}

if __name__ == "__main__":
    import uvicorn
    print("🎤 Offline Voice Cloning Backend (Demo Mode)")
    print("===========================================")
    print("🌐 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("ℹ️  Demo Mode: Web Speech API wird im Frontend verwendet")
    print("⏹️  Stoppen: Ctrl+C")
    print("")
    uvicorn.run(app, host="0.0.0.0", port=8000)