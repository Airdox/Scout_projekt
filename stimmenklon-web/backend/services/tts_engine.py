import asyncio
import logging
from typing import List, Dict, Any
import soundfile as sf
import numpy as np
from gtts import gTTS
import tempfile
import os
from pydub import AudioSegment
import librosa

logger = logging.getLogger(__name__)

class TTSEngine:
    def __init__(self):
        self.available_languages = {
            "de": "Deutsch",
            "en": "English", 
            "es": "Español",
            "fr": "Français",
            "it": "Italiano",
            "pt": "Português",
            "ru": "Русский",
            "nl": "Nederlands",
            "pl": "Polski",
            "tr": "Türkçe",
            "ko": "한국어",
            "ja": "日本語",
            "zh": "中文"
        }
        logger.info("TTS Engine initialized with gTTS backend")
    
    async def get_builtin_models(self) -> List[Dict[str, Any]]:
        """Get list of available built-in models"""
        models = []
        
        # Add German models
        models.append({
            "id": "gtts_de",
            "name": "Google TTS Deutsch",
            "language": "de", 
            "quality": "high",
            "is_custom": False,
            "description": "Google Text-to-Speech für Deutsch"
        })
        
        # Add English models
        models.append({
            "id": "gtts_en",
            "name": "Google TTS English",
            "language": "en",
            "quality": "high", 
            "is_custom": False,
            "description": "Google Text-to-Speech for English"
        })
        
        # Add other popular languages
        for lang_code, lang_name in self.available_languages.items():
            if lang_code not in ["de", "en"]:  # Already added above
                models.append({
                    "id": f"gtts_{lang_code}",
                    "name": f"Google TTS {lang_name}",
                    "language": lang_code,
                    "quality": "high",
                    "is_custom": False,
                    "description": f"Google Text-to-Speech für {lang_name}"
                })
        
        # Add enhanced model with voice effects
        models.append({
            "id": "enhanced_de",
            "name": "Enhanced Deutsch",
            "language": "de",
            "quality": "high",
            "is_custom": False,
            "description": "Erweiterte deutsche Sprachsynthese mit Stimmeffekten"
        })
        
        # Always provide a fallback option
        models.append({
            "id": "fallback",
            "name": "Einfache Synthese",
            "language": "de",
            "quality": "low", 
            "is_custom": False,
            "description": "Grundlegende Sprachsynthese (Fallback)"
        })
        
        return models
    
    async def synthesize(
        self, 
        text: str, 
        model_id: str, 
        output_path: str, 
        language: str = "de",
        speed: float = 1.0,
        pitch: float = 1.0
    ) -> str:
        """Synthesize speech using built-in models"""
        try:
            logger.info(f"Synthesizing with model {model_id}: '{text[:50]}...'")
            
            if model_id.startswith("gtts_"):
                # Extract language from model_id
                lang_code = model_id.split("_")[1]
                if lang_code not in self.available_languages:
                    lang_code = language
                
                await self._synthesize_with_gtts(text, output_path, lang_code, speed, pitch)
                
            elif model_id == "enhanced_de":
                # Use enhanced German synthesis with effects
                await self._synthesize_enhanced(text, output_path, "de", speed, pitch)
                
            elif model_id == "fallback":
                # Generate fallback audio
                await self._generate_fallback_audio(text, output_path)
            
            else:
                # Try to extract language and use gTTS
                lang_code = language if language in self.available_languages else "de"
                await self._synthesize_with_gtts(text, output_path, lang_code, speed, pitch)
            
            logger.info(f"Speech synthesis completed: {output_path}")
            return output_path
        
        except Exception as e:
            logger.error(f"TTS synthesis failed: {e}")
            # Generate fallback audio
            await self._generate_fallback_audio(text, output_path)
            return output_path
    
    async def _synthesize_with_gtts(
        self, 
        text: str, 
        output_path: str, 
        language: str,
        speed: float = 1.0,
        pitch: float = 1.0
    ):
        """Synthesize with Google TTS"""
        try:
            # Determine gTTS speed parameter
            slow = speed < 0.9
            
            # Create TTS object
            tts = gTTS(text=text, lang=language, slow=slow)
            
            # Save to temporary mp3 file
            temp_mp3 = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
            await asyncio.to_thread(tts.save, temp_mp3.name)
            
            # Load and process audio
            audio_segment = AudioSegment.from_mp3(temp_mp3.name)
            
            # Convert to numpy array for processing
            audio_data = np.array(audio_segment.get_array_of_samples(), dtype=np.float32)
            if audio_segment.channels == 2:
                audio_data = audio_data.reshape((-1, 2)).mean(axis=1)
            
            # Normalize
            audio_data = audio_data / np.max(np.abs(audio_data))
            sample_rate = audio_segment.frame_rate
            
            # Apply speed and pitch modifications
            if speed != 1.0 or pitch != 1.0:
                audio_data = await self._modify_audio_properties(audio_data, sample_rate, speed, pitch)
            
            # Save final audio
            sf.write(output_path, audio_data, sample_rate)
            
            # Cleanup
            os.unlink(temp_mp3.name)
            
        except Exception as e:
            logger.error(f"gTTS synthesis failed: {e}")
            raise
    
    async def _synthesize_enhanced(
        self, 
        text: str, 
        output_path: str, 
        language: str,
        speed: float = 1.0,
        pitch: float = 1.0
    ):
        """Enhanced synthesis with voice effects"""
        try:
            # First, generate with gTTS
            await self._synthesize_with_gtts(text, output_path, language, speed, pitch)
            
            # Load generated audio for enhancement
            audio, sr = librosa.load(output_path, sr=None)
            
            # Apply enhancements
            enhanced_audio = await self._apply_voice_enhancements(audio, sr)
            
            # Save enhanced audio
            sf.write(output_path, enhanced_audio, sr)
            
        except Exception as e:
            logger.error(f"Enhanced synthesis failed: {e}")
            # Fallback to regular gTTS
            await self._synthesize_with_gtts(text, output_path, language, speed, pitch)
    
    async def _apply_voice_enhancements(self, audio: np.ndarray, sample_rate: int) -> np.ndarray:
        """Apply voice enhancements to make speech more natural"""
        try:
            enhanced = audio.copy()
            
            # 1. Add subtle reverb
            enhanced = self._add_reverb(enhanced, sample_rate)
            
            # 2. Enhance formants
            enhanced = self._enhance_formants(enhanced, sample_rate)
            
            # 3. Add breath sounds
            enhanced = self._add_breath_sounds(enhanced, sample_rate)
            
            # 4. Dynamic range compression
            enhanced = self._apply_compression(enhanced)
            
            return enhanced
            
        except Exception as e:
            logger.warning(f"Voice enhancement failed: {e}")
            return audio
    
    def _add_reverb(self, audio: np.ndarray, sample_rate: int) -> np.ndarray:
        """Add subtle reverb effect"""
        try:
            # Simple reverb using delayed and attenuated copies
            reverb_delays = [0.03, 0.05, 0.08]  # delays in seconds
            reverb_gains = [0.3, 0.2, 0.1]
            
            enhanced = audio.copy()
            
            for delay, gain in zip(reverb_delays, reverb_gains):
                delay_samples = int(delay * sample_rate)
                if delay_samples < len(audio):
                    delayed = np.zeros_like(audio)
                    delayed[delay_samples:] = audio[:-delay_samples] * gain
                    enhanced += delayed
            
            # Normalize
            enhanced = enhanced / np.max(np.abs(enhanced))
            
            return enhanced
            
        except Exception as e:
            logger.warning(f"Reverb application failed: {e}")
            return audio
    
    def _enhance_formants(self, audio: np.ndarray, sample_rate: int) -> np.ndarray:
        """Enhance formant frequencies for clearer speech"""
        try:
            # Apply emphasis to formant regions (800-1200 Hz, 1200-2400 Hz)
            stft = librosa.stft(audio, hop_length=256, win_length=1024)
            magnitude = np.abs(stft)
            phase = np.angle(stft)
            
            freqs = librosa.fft_frequencies(sr=sample_rate, n_fft=1024)
            
            # Enhance formant regions
            for i, freq in enumerate(freqs):
                if 800 <= freq <= 1200:  # First formant region
                    magnitude[i] *= 1.2
                elif 1200 <= freq <= 2400:  # Second formant region
                    magnitude[i] *= 1.15
            
            # Reconstruct audio
            enhanced_stft = magnitude * np.exp(1j * phase)
            enhanced = librosa.istft(enhanced_stft, hop_length=256, win_length=1024)
            
            return enhanced
            
        except Exception as e:
            logger.warning(f"Formant enhancement failed: {e}")
            return audio
    
    def _add_breath_sounds(self, audio: np.ndarray, sample_rate: int) -> np.ndarray:
        """Add subtle breath sounds at word boundaries"""
        try:
            # Detect silence gaps (potential word boundaries)
            rms = librosa.feature.rms(y=audio, frame_length=1024, hop_length=512)[0]
            threshold = np.percentile(rms, 20)  # Bottom 20% as silence
            
            silence_frames = rms < threshold
            silence_boundaries = np.diff(silence_frames.astype(int))
            
            # Add breath sounds at silence-to-speech transitions
            breath_duration = int(0.05 * sample_rate)  # 50ms breath
            breath_amplitude = 0.05
            
            enhanced = audio.copy()
            
            for i, boundary in enumerate(silence_boundaries):
                if boundary == 1:  # Silence to speech transition
                    frame_idx = i * 512  # Convert frame to sample index
                    if frame_idx + breath_duration < len(enhanced):
                        # Generate breath sound (filtered noise)
                        breath = np.random.normal(0, breath_amplitude, breath_duration)
                        # Apply high-pass filter for breath-like sound
                        breath = librosa.effects.preemphasis(breath)
                        # Mix with existing audio
                        enhanced[frame_idx:frame_idx + breath_duration] += breath * 0.3
            
            return enhanced
            
        except Exception as e:
            logger.warning(f"Breath sound addition failed: {e}")
            return audio
    
    def _apply_compression(self, audio: np.ndarray) -> np.ndarray:
        """Apply dynamic range compression"""
        try:
            # Simple compression using soft limiting
            threshold = 0.7
            ratio = 4.0
            
            compressed = audio.copy()
            
            # Apply compression to samples above threshold
            over_threshold = np.abs(compressed) > threshold
            excess = np.abs(compressed[over_threshold]) - threshold
            compressed[over_threshold] = np.sign(compressed[over_threshold]) * (
                threshold + excess / ratio
            )
            
            return compressed
            
        except Exception as e:
            logger.warning(f"Compression failed: {e}")
            return audio
    
    async def _modify_audio_properties(
        self, 
        audio: np.ndarray, 
        sample_rate: int, 
        speed: float, 
        pitch: float
    ) -> np.ndarray:
        """Modify audio speed and pitch"""
        try:
            modified = audio.copy()
            
            # Modify speed (time stretching)
            if abs(speed - 1.0) > 0.05:
                modified = librosa.effects.time_stretch(modified, rate=speed)
            
            # Modify pitch (pitch shifting)
            if abs(pitch - 1.0) > 0.05:
                # Convert pitch factor to semitones
                semitones = 12 * np.log2(pitch)
                modified = librosa.effects.pitch_shift(modified, sr=sample_rate, n_steps=semitones)
            
            return modified
            
        except Exception as e:
            logger.warning(f"Audio modification failed: {e}")
            return audio
    
    async def _generate_fallback_audio(self, text: str, output_path: str):
        """Generate simple fallback audio"""
        try:
            # Create a simple synthesized speech using basic signal processing
            sample_rate = 22050
            
            # Estimate duration based on text length (average speaking rate)
            words = len(text.split())
            duration = max(1.0, words * 0.6)  # ~100 words per minute
            
            # Generate basic speech-like audio
            t = np.linspace(0, duration, int(sample_rate * duration))
            
            # Create formant-like frequencies for speech simulation
            f0 = 120  # Fundamental frequency (pitch)
            formant1 = 800   # First formant (vowel quality)
            formant2 = 1200  # Second formant
            
            # Generate audio with multiple harmonics
            audio = np.zeros_like(t)
            
            # Add fundamental and harmonics
            for harmonic in range(1, 8):
                freq = f0 * harmonic
                amplitude = 1.0 / harmonic  # Decreasing amplitude for higher harmonics
                
                # Add some variation to make it more speech-like
                freq_variation = 1 + 0.1 * np.sin(2 * np.pi * 2 * t)  # Slight frequency modulation
                audio += amplitude * np.sin(2 * np.pi * freq * freq_variation * t)
            
            # Add formant filtering effect (simplified)
            formant_effect = (
                np.sin(2 * np.pi * formant1 * t) * 0.3 +
                np.sin(2 * np.pi * formant2 * t) * 0.2
            )
            audio *= (1 + formant_effect)
            
            # Add speech-like amplitude modulation
            word_boundaries = np.linspace(0, duration, words + 1)
            for i in range(words):
                start_idx = int(word_boundaries[i] * sample_rate)
                end_idx = int(word_boundaries[i + 1] * sample_rate)
                
                if end_idx <= len(audio):
                    # Create word-like envelope
                    word_length = end_idx - start_idx
                    if word_length > 0:
                        envelope = np.concatenate([
                            np.linspace(0, 1, max(1, word_length // 4)),      # Attack
                            np.ones(max(1, word_length // 2)),                # Sustain
                            np.linspace(1, 0, max(1, word_length - word_length // 4 - word_length // 2))  # Release
                        ])
                        
                        if len(envelope) == word_length:
                            audio[start_idx:end_idx] *= envelope
                        
                        # Add pause between words
                        pause_start = end_idx
                        pause_end = min(pause_start + sample_rate // 10, len(audio))  # 0.1s pause
                        audio[pause_start:pause_end] *= 0.1
            
            # Normalize and apply final processing
            audio = audio * 0.3  # Reduce volume
            audio = np.clip(audio, -1.0, 1.0)  # Prevent clipping
            
            # Save audio
            sf.write(output_path, audio, sample_rate)
            
            logger.info(f"Generated fallback audio for {words} words, {duration:.1f}s duration")
        
        except Exception as e:
            logger.error(f"Fallback audio generation failed: {e}")
            # Create minimal beep as last resort
            sample_rate = 22050
            duration = 1.0
            t = np.linspace(0, duration, int(sample_rate * duration))
            audio = 0.1 * np.sin(2 * np.pi * 440 * t)  # Simple 440Hz tone
            sf.write(output_path, audio, sample_rate)
    
    def get_model_info(self, model_id: str) -> Dict[str, Any]:
        """Get detailed information about a specific model"""
        if model_id.startswith("gtts_"):
            lang_code = model_id.split("_")[1]
            lang_name = self.available_languages.get(lang_code, lang_code)
            return {
                "id": model_id,
                "name": f"Google TTS {lang_name}",
                "language": lang_code,
                "description": f"Google Text-to-Speech für {lang_name}",
                "sample_rate": 22050,
                "supports_emotions": False,
                "supports_speed_control": True,
                "supports_pitch_control": True,
                "backend": "gTTS"
            }
        elif model_id == "enhanced_de":
            return {
                "id": "enhanced_de",
                "name": "Enhanced Deutsch",
                "language": "de",
                "description": "Erweiterte deutsche Sprachsynthese mit Reverb, Formant-Enhancement und natürlichen Atemgeräuschen",
                "sample_rate": 22050,
                "supports_emotions": False,
                "supports_speed_control": True,
                "supports_pitch_control": True,
                "backend": "gTTS + Enhancement"
            }
        elif model_id == "fallback":
            return {
                "id": "fallback",
                "name": "Einfache Synthese",
                "language": "de",
                "description": "Grundlegende Signalverarbeitung für Sprachsynthese",
                "sample_rate": 22050,
                "supports_emotions": False,
                "supports_speed_control": False,
                "supports_pitch_control": False,
                "backend": "Signal Processing"
            }
        else:
            return {"error": "Model not found"}