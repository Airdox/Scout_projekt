import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  Volume2, 
  Users, 
  FileAudio,
  Zap,
  Cpu,
  HardDrive,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const API_BASE = 'http://localhost:8000/api';

interface VoiceModel {
  id: string;
  name: string;
  description: string;
  quality_score: number;
  created_at: string;
  audio_files: string[];
}

interface Voice {
  id: string;
  name: string;
  language: string;
}

interface AudioFile {
  id: string;
  filename: string;
  path: string;
  quality_score: number;
  duration: number;
}

export default function VoiceCloningApp() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<AudioFile[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [ttsText, setTtsText] = useState('');
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  // Lokale Stimmen laden
  useEffect(() => {
    fetchVoices();
    fetchVoiceModels();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch(`${API_BASE}/voices`);
      const data = await response.json();
      setVoices(data.voices);
      if (data.voices.length > 0) {
        setSelectedVoice(data.voices[0].id);
      }
    } catch (error) {
      showAlert('error', 'Fehler beim Laden der Stimmen');
    }
  };

  const fetchVoiceModels = async () => {
    try {
      const response = await fetch(`${API_BASE}/voice-models`);
      const data = await response.json();
      setVoiceModels(data.models);
    } catch (error) {
      showAlert('error', 'Fehler beim Laden der Voice Models');
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsLoading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE}/upload-audio`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(prev => [...prev, ...data.uploaded_files]);
        showAlert('success', `${data.count} Audio-Dateien erfolgreich hochgeladen`);
      } else {
        showAlert('error', 'Fehler beim Hochladen der Audio-Dateien');
      }
    } catch (error) {
      showAlert('error', 'Netzwerkfehler beim Hochladen');
    } finally {
      setIsLoading(false);
    }
  };

  const createVoiceModel = async () => {
    if (!modelName.trim() || uploadedFiles.length === 0) {
      showAlert('error', 'Bitte Model-Name eingeben und Audio-Dateien hochladen');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/create-voice-model?model_name=${encodeURIComponent(modelName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadedFiles.map(f => f.path))
      });

      if (response.ok) {
        const data = await response.json();
        showAlert('success', `Voice Model "${modelName}" erfolgreich erstellt`);
        setModelName('');
        setUploadedFiles([]);
        fetchVoiceModels();
      } else {
        showAlert('error', 'Fehler beim Erstellen des Voice Models');
      }
    } catch (error) {
      showAlert('error', 'Netzwerkfehler beim Erstellen des Models');
    } finally {
      setIsLoading(false);
    }
  };

  const synthesizeText = async () => {
    if (!ttsText.trim()) {
      showAlert('error', 'Bitte Text eingeben');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/synthesize?text=${encodeURIComponent(ttsText)}&voice_id=${selectedVoice}`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        showAlert('success', 'Sprachsynthese erfolgreich abgeschlossen');
        
        // Audio automatisch abspielen
        const audioUrl = `${API_BASE}/audio/${data.output_file.split('/').pop()}`;
        playAudio(audioUrl);
      } else {
        showAlert('error', 'Fehler bei der Sprachsynthese');
      }
    } catch (error) {
      showAlert('error', 'Netzwerkfehler bei der Synthese');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    setAudioPlaying(audioUrl);
    audio.play();
    audio.onended = () => setAudioPlaying(null);
  };

  const deleteModel = async (modelId: string) => {
    try {
      const response = await fetch(`${API_BASE}/voice-models/${modelId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showAlert('success', 'Voice Model gelöscht');
        fetchVoiceModels();
      } else {
        showAlert('error', 'Fehler beim Löschen des Models');
      }
    } catch (error) {
      showAlert('error', 'Netzwerkfehler beim Löschen');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Mic className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Offline Voice Cloning</h1>
              <p className="text-sm text-muted-foreground">Lokale Sprachsynthese ohne externe Dependencies</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Cpu className="h-3 w-3" />
                Offline
              </Badge>
              <Badge variant="outline" className="gap-1">
                <HardDrive className="h-3 w-3" />
                Lokal
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Alert */}
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'error' ? 'border-destructive' : 'border-green-500'}`}>
            {alert.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="tts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tts" className="gap-2">
              <Volume2 className="h-4 w-4" />
              Text-zu-Sprache
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2">
              <FileAudio className="h-4 w-4" />
              Voice Training
            </TabsTrigger>
            <TabsTrigger value="models" className="gap-2">
              <Users className="h-4 w-4" />
              Voice Models
            </TabsTrigger>
          </TabsList>

          {/* Text-zu-Sprache Tab */}
          <TabsContent value="tts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Sprachsynthese
                </CardTitle>
                <CardDescription>
                  Text in gesprochene Sprache umwandeln mit lokalen Stimmen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="voice-select">Stimme auswählen</Label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Stimme wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name} ({voice.language})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tts-text">Text eingeben</Label>
                  <Textarea
                    id="tts-text"
                    placeholder="Hier den Text eingeben, der gesprochen werden soll..."
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={synthesizeText} 
                  disabled={isLoading || !ttsText.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Synthese läuft...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Sprache generieren
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Training Tab */}
          <TabsContent value="training">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Audio-Dateien hochladen
                  </CardTitle>
                  <CardDescription>
                    WAV, MP3 oder FLAC-Dateien für Voice-Training hochladen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Audio-Dateien hier ablegen oder auswählen
                      </p>
                      <Input
                        type="file"
                        multiple
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="max-w-xs"
                      />
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Hochgeladene Dateien:</h4>
                        {uploadedFiles.map(file => (
                          <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="text-sm font-medium">{file.filename}</p>
                              <p className="text-xs text-muted-foreground">
                                Qualität: {file.quality_score} | Dauer: {file.duration.toFixed(1)}s
                              </p>
                            </div>
                            <Badge variant={file.quality_score > 0.7 ? 'default' : 'secondary'}>
                              {file.quality_score > 0.7 ? 'Gut' : 'OK'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileAudio className="h-5 w-5" />
                    Voice Model erstellen
                  </CardTitle>
                  <CardDescription>
                    Neues Voice Model aus hochgeladenen Audio-Dateien trainieren
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="model-name">Model-Name</Label>
                      <Input
                        id="model-name"
                        placeholder="z.B. Meine Stimme"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                      />
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileAudio className="h-4 w-4" />
                        <span className="text-sm font-medium">Training-Status</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {uploadedFiles.length} Audio-Dateien hochgeladen
                      </p>
                    </div>

                    <Button 
                      onClick={createVoiceModel}
                      disabled={isLoading || !modelName.trim() || uploadedFiles.length === 0}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Model wird erstellt...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileAudio className="h-4 w-4" />
                          Voice Model erstellen
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Voice Models Tab */}
          <TabsContent value="models">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Meine Voice Models
                </CardTitle>
                <CardDescription>
                  Übersicht aller erstellten Voice Models
                </CardDescription>
              </CardHeader>
              <CardContent>
                {voiceModels.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Noch keine Voice Models erstellt</p>
                    <p className="text-sm text-muted-foreground">Erstellen Sie Ihr erstes Model im Voice Training Tab</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {voiceModels.map(model => (
                      <Card key={model.id} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{model.name}</CardTitle>
                              <CardDescription className="text-xs">
                                Erstellt: {new Date(model.created_at).toLocaleDateString('de-DE')}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteModel(model.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Qualität</span>
                                <span>{(model.quality_score * 100).toFixed(0)}%</span>
                              </div>
                              <Progress value={model.quality_score * 100} className="h-2" />
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Audio-Dateien:</span>
                              <Badge variant="outline">{model.audio_files.length}</Badge>
                            </div>
                            
                            <Button variant="outline" size="sm" className="w-full">
                              <Play className="h-3 w-3 mr-1" />
                              Testen
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
