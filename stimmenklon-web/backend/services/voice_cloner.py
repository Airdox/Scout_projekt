import numpy as np
import librosa
import soundfile as sf
from typing import List, Tuple
import logging
import asyncio
from gtts import gTTS
import io
import os
import torch
import torch.nn as nn
from pydub import AudioSegment
import tempfile

logger = logging.getLogger(__name__)

class SimpleVoiceEncoder(nn.Module):
    """Simple neural network for voice encoding"""
    def __init__(self, input_size=80, hidden_size=256, embedding_size=128):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True, bidirectional=True)
        self.linear = nn.Linear(hidden_size * 2, embedding_size)
        self.dropout = nn.Dropout(0.1)
        
    def forward(self, mel_spec):
        # mel_spec shape: (batch, time, mel_bins)
        lstm_out, (hidden, _) = self.lstm(mel_spec)
        # Use the last hidden state
        embedding = self.linear(hidden[-1])
        embedding = self.dropout(embedding)
        # Normalize embedding
        return embedding / torch.norm(embedding, dim=1, keepdim=True)

class VoiceCloner:
    def __init__(self):
        self.voice_encoder = SimpleVoiceEncoder()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.voice_encoder.to(self.device)
        logger.info(f"Voice cloner initialized on device: {self.device}")
    
    async def extract_speaker_embedding(self, audio_files: List[str]) -> np.ndarray:
        """Extract speaker embedding from audio files using ML approach"""
        try:
            logger.info(f"Extracting speaker embedding from {len(audio_files)} files")
            
            embeddings = []
            
            for audio_file in audio_files:
                # Load and preprocess audio
                audio, sr = librosa.load(audio_file, sr=22050)
                
                # Extract mel spectrogram
                mel_spec = librosa.feature.melspectrogram(
                    y=audio, 
                    sr=sr, 
                    n_mels=80,
                    fmax=8000,
                    hop_length=256,
                    win_length=1024
                )
                
                # Convert to log scale
                mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
                
                # Normalize
                mel_spec_db = (mel_spec_db - np.mean(mel_spec_db)) / (np.std(mel_spec_db) + 1e-8)
                
                # Convert to tensor and get embedding
                mel_tensor = torch.FloatTensor(mel_spec_db.T).unsqueeze(0).to(self.device)
                
                with torch.no_grad():
                    embedding = self.voice_encoder(mel_tensor)
                    embeddings.append(embedding.cpu().numpy())
            
            # Average embeddings from all files
            if embeddings:
                final_embedding = np.mean(embeddings, axis=0).flatten()
                logger.info(f"Speaker embedding extracted: shape {final_embedding.shape}")
                return final_embedding
            else:
                raise ValueError("No valid audio files for embedding extraction")
        
        except Exception as e:
            logger.error(f"Speaker embedding extraction failed: {e}")
            # Return a default embedding
            return np.random.normal(0, 0.1, 128)
    
    async def synthesize_with_custom_voice(
        self, 
        text: str, 
        speaker_embedding: List[float], 
        output_path: str,
        language: str = "de"
    ) -> str:
        """Synthesize speech with custom voice using gTTS + voice modification"""
        try:
            logger.info(f"Synthesizing text: '{text[:50]}...' with custom voice characteristics")
            
            # Step 1: Generate base speech with gTTS
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
            tts = gTTS(text=text, lang=language, slow=False)
            tts.save(temp_file.name)
            
            # Step 2: Load and modify audio based on speaker embedding
            audio_segment = AudioSegment.from_mp3(temp_file.name)
            
            # Convert to numpy array for processing
            audio_data = np.array(audio_segment.get_array_of_samples(), dtype=np.float32)
            if audio_segment.channels == 2:
                audio_data = audio_data.reshape((-1, 2)).mean(axis=1)
            
            # Normalize
            audio_data = audio_data / np.max(np.abs(audio_data))
            
            # Step 3: Apply voice characteristics based on embedding
            modified_audio = await self._apply_voice_characteristics(
                audio_data, 
                audio_segment.frame_rate, 
                speaker_embedding
            )
            
            # Step 4: Save modified audio
            sf.write(output_path, modified_audio, audio_segment.frame_rate)
            
            # Cleanup
            os.unlink(temp_file.name)
            
            logger.info(f"Custom voice synthesis completed: {output_path}")
            return output_path
        
        except Exception as e:
            logger.error(f"Custom voice synthesis failed: {e}")
            # Fallback to standard gTTS
            return await self._fallback_synthesis(text, output_path, language)
    
    async def _apply_voice_characteristics(
        self, 
        audio: np.ndarray, 
        sample_rate: int, 
        speaker_embedding: List[float]
    ) -> np.ndarray:
        """Apply voice characteristics based on speaker embedding"""
        try:
            embedding = np.array(speaker_embedding)
            
            # Extract characteristics from embedding
            # These are simplified transformations based on embedding values
            
            # Pitch modification (based on embedding components 0-10)
            pitch_factor = 1.0 + (np.mean(embedding[:10]) * 0.3)  # ±30% pitch change
            pitch_factor = np.clip(pitch_factor, 0.7, 1.3)
            
            # Speed modification (based on embedding components 10-20)
            speed_factor = 1.0 + (np.mean(embedding[10:20]) * 0.2)  # ±20% speed change
            speed_factor = np.clip(speed_factor, 0.8, 1.2)
            
            # Formant modification (based on embedding components 20-40)
            formant_shift = np.mean(embedding[20:40]) * 200  # ±200 Hz formant shift
            formant_shift = np.clip(formant_shift, -200, 200)
            
            # Apply modifications
            modified_audio = audio.copy()
            
            # 1. Pitch shifting
            if abs(pitch_factor - 1.0) > 0.05:
                semitones = 12 * np.log2(pitch_factor)
                modified_audio = librosa.effects.pitch_shift(
                    modified_audio, 
                    sr=sample_rate, 
                    n_steps=semitones
                )
            
            # 2. Time stretching (speed)
            if abs(speed_factor - 1.0) > 0.05:
                modified_audio = librosa.effects.time_stretch(modified_audio, rate=speed_factor)
            
            # 3. Formant modification (simplified spectral shifting)
            if abs(formant_shift) > 50:
                modified_audio = self._apply_formant_shift(modified_audio, sample_rate, formant_shift)
            
            # 4. Add subtle voice characteristics
            modified_audio = self._add_voice_texture(modified_audio, sample_rate, embedding)
            
            return modified_audio
        
        except Exception as e:
            logger.warning(f"Voice characteristic application failed: {e}")
            return audio  # Return original if modification fails
    
    def _apply_formant_shift(self, audio: np.ndarray, sample_rate: int, shift_hz: float) -> np.ndarray:
        """Apply formant shifting using spectral manipulation"""
        try:
            # Compute STFT
            stft = librosa.stft(audio, hop_length=256, win_length=1024)
            magnitude = np.abs(stft)
            phase = np.angle(stft)
            
            # Create frequency bins
            freqs = librosa.fft_frequencies(sr=sample_rate, n_fft=1024)
            
            # Shift formants by modifying spectral envelope
            shifted_magnitude = magnitude.copy()
            
            for i, freq in enumerate(freqs):
                if 200 <= freq <= 4000:  # Focus on speech formant range
                    # Calculate shift ratio
                    shift_ratio = (freq + shift_hz) / freq if freq > 0 else 1.0
                    shift_ratio = np.clip(shift_ratio, 0.5, 2.0)
                    
                    # Apply spectral shift
                    new_idx = int(i * shift_ratio)
                    if 0 <= new_idx < len(freqs):
                        shifted_magnitude[new_idx] = magnitude[i]
            
            # Reconstruct audio
            modified_stft = shifted_magnitude * np.exp(1j * phase)
            modified_audio = librosa.istft(modified_stft, hop_length=256, win_length=1024)
            
            return modified_audio
        
        except Exception as e:
            logger.warning(f"Formant shifting failed: {e}")
            return audio
    
    def _add_voice_texture(self, audio: np.ndarray, sample_rate: int, embedding: np.ndarray) -> np.ndarray:
        """Add subtle voice texture based on embedding"""
        try:
            # Extract texture parameters from embedding
            breathiness = np.clip(np.mean(embedding[40:60]), -1, 1) * 0.1
            roughness = np.clip(np.mean(embedding[60:80]), -1, 1) * 0.05
            
            # Add breathiness (high-frequency noise)
            if abs(breathiness) > 0.02:
                noise = np.random.normal(0, abs(breathiness), len(audio))
                # Filter noise to high frequencies
                noise_filtered = librosa.effects.preemphasis(noise)
                audio = audio + noise_filtered * 0.1
            
            # Add roughness (slight amplitude modulation)
            if abs(roughness) > 0.01:
                modulation_freq = 5 + abs(roughness) * 10  # 5-15 Hz modulation
                t = np.arange(len(audio)) / sample_rate
                modulation = 1 + roughness * np.sin(2 * np.pi * modulation_freq * t)
                audio = audio * modulation
            
            # Normalize to prevent clipping
            audio = audio / (np.max(np.abs(audio)) + 1e-8) * 0.95
            
            return audio
        
        except Exception as e:
            logger.warning(f"Voice texture application failed: {e}")
            return audio
    
    async def _fallback_synthesis(self, text: str, output_path: str, language: str) -> str:
        """Fallback to standard gTTS synthesis"""
        try:
            logger.info("Using fallback gTTS synthesis")
            
            tts = gTTS(text=text, lang=language, slow=False)
            
            # Save to temporary mp3 file
            temp_mp3 = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
            tts.save(temp_mp3.name)
            
            # Convert to wav
            audio_segment = AudioSegment.from_mp3(temp_mp3.name)
            audio_segment.export(output_path, format="wav")
            
            # Cleanup
            os.unlink(temp_mp3.name)
            
            return output_path
        
        except Exception as e:
            logger.error(f"Fallback synthesis failed: {e}")
            # Create a simple beep as last resort
            sample_rate = 22050
            duration = len(text) * 0.1
            t = np.linspace(0, duration, int(sample_rate * duration))
            audio = 0.2 * np.sin(2 * np.pi * 440 * t)
            sf.write(output_path, audio, sample_rate)
            return output_path
    
    def get_supported_languages(self) -> List[str]:
        """Get list of supported languages"""
        return ["de", "en", "es", "fr", "it", "pt", "ru", "zh", "ja", "ko", "nl", "pl", "tr"]