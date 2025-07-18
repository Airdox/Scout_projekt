from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import aiofiles
import uuid
import sqlite3
from datetime import datetime
import json
from typing import List, Optional
import pyttsx3
import threading
import tempfile
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

class AudioProcessor:
    """Einfache Audio-Verarbeitung ohne externe Libraries"""
    
    @staticmethod
    def preprocess_audio(file_path: str) -> tuple:
        """Basis Audio-Verarbeitung"""
        try:
            # Einfache Dateigröße und Format-Checks
            file_size = os.path.getsize(file_path)
            file_ext = os.path.splitext(file_path)[1].lower()
            
            # Qualitätsbewertung basierend auf Dateigröße und Format
            quality_score = 0.5  # Standard-Qualität
            
            if file_ext in ['.wav', '.flac']:
                quality_score += 0.3
            elif file_ext in ['.mp3']:
                quality_score += 0.2
            
            if file_size > 1024 * 1024:  # > 1MB
                quality_score += 0.2
            
            quality_score = min(1.0, quality_score)
            
            return True, 22050, quality_score  # success, sample_rate, quality
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Audio-Verarbeitung fehlgeschlagen: {str(e)}")

class LocalTTSEngine:
    """Lokale Text-zu-Sprache Engine mit pyttsx3"""
    
    def __init__(self):
        try:
            self.engine = pyttsx3.init()
            
            # Verfügbare Stimmen laden
            voices = self.engine.getProperty('voices')
            self.available_voices = []
            
            for i, voice in enumerate(voices):
                self.available_voices.append({
                    'id': str(i),
                    'name': voice.name if hasattr(voice, 'name') else f'Voice {i}',
                    'language': getattr(voice, 'languages', ['Unknown'])[0] if hasattr(voice, 'languages') else 'Unknown'
                })
                
            # Falls keine Stimmen gefunden, Standard-Stimme hinzufügen
            if not self.available_voices:
                self.available_voices.append({
                    'id': '0',
                    'name': 'Standard Voice',
                    'language': 'en-US'
                })
                
        except Exception as e:
            print(f"TTS Engine Initialisierung fehlgeschlagen: {e}")
            # Fallback für Systeme ohne TTS
            self.engine = None
            self.available_voices = [{
                'id': '0',
                'name': 'TTS nicht verfügbar',
                'language': 'N/A'
            }]
    
    def get_available_voices(self):
        """Lokale Systemstimmen zurückgeben"""
        return self.available_voices
    
    def synthesize_text(self, text: str, voice_id: str = "0") -> str:
        """Text zu Sprache mit lokaler Engine"""
        try:
            if not self.engine:
                raise HTTPException(status_code=500, detail="TTS Engine nicht verfügbar")
                
            # Temporäre Datei für Output
            output_file = OUTPUT_DIR / f"tts_{uuid.uuid4().hex}.wav"
            
            # pyttsx3 konfigurieren
            voices = self.engine.getProperty('voices')
            if voices and int(voice_id) < len(voices):
                self.engine.setProperty('voice', voices[int(voice_id)].id)
            
            # Sprache und Geschwindigkeit einstellen
            self.engine.setProperty('rate', 150)
            self.engine.setProperty('volume', 0.9)
            
            # Audio speichern
            self.engine.save_to_file(text, str(output_file))
            self.engine.runAndWait()
            
            return str(output_file)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"TTS-Synthese fehlgeschlagen: {str(e)}")

class SimpleVoiceCloner:
    """Einfaches Voice-Cloning Simulation für Demo-Zwecke"""
    
    @staticmethod
    def create_voice_model(audio_files: List[str], model_name: str) -> dict:
        """Einfaches Voice Model aus Audio-Dateien erstellen"""
        try:
            model_id = str(uuid.uuid4())
            model_path = MODELS_DIR / f"{model_id}.json"
            
            # Basis-Features sammeln
            model_features = {
                'audio_files': audio_files,
                'file_count': len(audio_files),
                'total_size': sum(os.path.getsize(f) for f in audio_files if os.path.exists(f))
            }
            
            # Einfache Qualitätsbewertung
            quality_score = 0.7 if len(audio_files) >= 3 else 0.5
            
            # Model-Metadaten
            model_data = {
                'id': model_id,
                'name': model_name,
                'features': model_features,
                'quality_score': quality_score,
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
tts_engine = LocalTTSEngine()

@app.get("/")
async def root():
    return {"message": "Offline Voice Cloning API", "version": "1.0.0", "tts_available": tts_engine.engine is not None}

@app.get("/api/voices")
async def get_available_voices():
    """Verfügbare lokale Stimmen zurückgeben"""
    return {
        "voices": tts_engine.get_available_voices(),
        "count": len(tts_engine.available_voices)
    }

@app.post("/api/upload-audio")
async def upload_audio(files: List[UploadFile] = File(...)):
    """Audio-Dateien für Voice-Training hochladen"""
    uploaded_files = []
    
    for file in files:
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail=f"Datei {file.filename} ist keine Audio-Datei")
        
        # Eindeutigen Dateinamen generieren
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        save_path = UPLOAD_DIR / f"{file_id}{file_extension}"
        
        # Datei speichern
        async with aiofiles.open(save_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Audio verarbeiten
        try:
            success, sample_rate, quality = AudioProcessor.preprocess_audio(str(save_path))
            
            # Geschätzte Dauer basierend auf Dateigröße
            file_size = os.path.getsize(save_path)
            estimated_duration = file_size / (sample_rate * 2)  # Grobe Schätzung
            
            uploaded_files.append({
                "id": file_id,
                "filename": file.filename,
                "path": str(save_path),
                "quality_score": quality,
                "duration": estimated_duration,
                "sample_rate": sample_rate
            })
            
        except Exception as e:
            # Fehlerhafter Upload löschen
            if save_path.exists():
                save_path.unlink()
            raise HTTPException(status_code=400, detail=f"Audio-Verarbeitung für {file.filename} fehlgeschlagen: {str(e)}")
    
    return {"uploaded_files": uploaded_files, "count": len(uploaded_files)}

@app.post("/api/create-voice-model")
async def create_voice_model(model_name: str, audio_file_paths: List[str]):
    """Voice Model aus hochgeladenen Audio-Dateien erstellen"""
    
    if not model_name.strip():
        raise HTTPException(status_code=400, detail="Model-Name ist erforderlich")
    
    if len(audio_file_paths) < 1:
        raise HTTPException(status_code=400, detail="Mindestens eine Audio-Datei ist erforderlich")
    
    # Prüfen ob Dateien existieren
    existing_files = []
    for file_path in audio_file_paths:
        if os.path.exists(file_path):
            existing_files.append(file_path)
    
    if not existing_files:
        raise HTTPException(status_code=400, detail="Keine gültigen Audio-Dateien gefunden")
    
    # Voice Model erstellen
    model_data = SimpleVoiceCloner.create_voice_model(existing_files, model_name)
    
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
        json.dumps(existing_files),
        str(MODELS_DIR / f"{model_data['id']}.json"),
        model_data['quality_score']
    ))
    
    conn.commit()
    conn.close()
    
    return model_data

@app.get("/api/voice-models")
async def get_voice_models():
    """Alle erstellten Voice Models zurückgeben"""
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
    """Text zu Sprache synthetisieren"""
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text ist erforderlich")
    
    # Standard-TTS verwenden (Voice-Cloning-Models sind Demo-Version)
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
        "model_id": model_id
    }

@app.get("/api/audio/{filename}")
async def get_audio(filename: str):
    """Audio-Datei zurückgeben"""
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio-Datei nicht gefunden")
    
    return FileResponse(file_path, media_type="audio/wav", filename=filename)

@app.get("/api/tts-history")
async def get_tts_history():
    """TTS-Historie zurückgeben"""
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
    """Voice Model löschen"""
    conn = sqlite3.connect(BASE_DIR / "voice_cloning.db")
    cursor = conn.cursor()
    
    # Model-Daten abrufen
    cursor.execute("SELECT model_path FROM voice_models WHERE id = ?", (model_id,))
    result = cursor.fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Voice Model nicht gefunden")
    
    # Model-Datei löschen
    model_path = Path(result[0])
    if model_path.exists():
        model_path.unlink()
    
    # Aus Datenbank entfernen
    cursor.execute("DELETE FROM voice_models WHERE id = ?", (model_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Voice Model erfolgreich gelöscht"}

if __name__ == "__main__":
    import uvicorn
    print("🎤 Offline Voice Cloning Backend")
    print("=================================")
    print("🌐 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("⏹️  Stoppen: Ctrl+C")
    uvicorn.run(app, host="0.0.0.0", port=8000)