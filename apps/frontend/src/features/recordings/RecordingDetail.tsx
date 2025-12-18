
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2, Video, Sparkles, Mic, Layout, FileText, Download } from 'lucide-react';
import { Recording } from '../../types';
import { NodeLayer } from '../../services/processing.service';

interface RecordingDetailProps {
    id: string;
    onBack: () => void;
}

export function RecordingDetail({ id, onBack }: RecordingDetailProps) {
    const [rec, setRec] = useState<Recording | null>(null);
    const [activeTab, setActiveTab] = useState<'guide' | 'transcript'>('guide');
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1.0);

    const [audioMode, setAudioMode] = useState<'ai' | 'original'>('ai');

    const videoRef = useRef<HTMLVideoElement>(null);
    const currentAiAudioRef = useRef<HTMLAudioElement | null>(null);
    const lastPlayedStepRef = useRef<number>(-1);

    // Sync volume changes
    useEffect(() => {
        if (videoRef.current) videoRef.current.volume = volume;
        if (currentAiAudioRef.current) currentAiAudioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        NodeLayer.getRecordingById(id).then(setRec);
        return NodeLayer.subscribe((all) => {
            const found = all.find(r => r.id === id);
            if (found) setRec(found);
        });
    }, [id]);

    useEffect(() => {
        return () => {
            if (currentAiAudioRef.current) {
                currentAiAudioRef.current.pause();
                currentAiAudioRef.current = null;
            }
        };
    }, [id]);

    // --- AI VOICE CONTINUOUS PLAYBACK ---
    const playNextAudio = async (index: number) => {
        if (index >= (rec?.generatedGuide?.steps.length || 0)) return;
        if (!isPlaying) return; // Stop if paused

        const step = rec?.generatedGuide?.steps[index];
        if (!step?.audio?.audioUrl) {
            // Skip to next if no audio
            playNextAudio(index + 1);
            return;
        }

        try {
            if (currentAiAudioRef.current) {
                currentAiAudioRef.current.pause();
            }

            const audio = new Audio(step.audio.audioUrl);
            currentAiAudioRef.current = audio;
            audio.volume = 1.0;

            // Sync logic: When this audio starts, ensure video is at the step start?
            // Optional: seekTo(step.timestamp.startMs); 
            // Better: Just play audio.

            audio.onended = () => {
                playNextAudio(index + 1);
            };

            await audio.play();
        } catch (e) {
            console.warn("Audio play failed", e);
            playNextAudio(index + 1);
        }
    };

    const isWaitingForAudioRef = useRef(false);

    // Effect: Handle Video Sync (Visual Only)
    useEffect(() => {
        const v = videoRef.current;
        if (!v || !rec?.generatedGuide) return;

        const handleTimeUpdate = () => {
            const t = v.currentTime * 1000;
            const steps = rec.generatedGuide!.steps;
            const currentStepIndex = steps.findIndex(s => t >= s.timestamp.startMs && t < s.timestamp.endMs);
            const currentStep = steps[currentStepIndex];

            // Sync AI Audio Trigger
            if (audioMode === 'ai' && isPlaying) {
                // 1. Trigger Audio for new step
                if (currentStepIndex !== -1 && currentStepIndex !== lastPlayedStepRef.current) {
                    lastPlayedStepRef.current = currentStepIndex;
                    playAiAudioForStep(currentStepIndex);
                }

                // 2. Check for Sync (Pause video if audio needs more time)
                if (currentStep && currentAiAudioRef.current && !currentAiAudioRef.current.paused) {
                    const timeRemainingInStep = currentStep.timestamp.endMs - t;
                    // If we are near the end of the step (< 200ms) and audio is still playing
                    if (timeRemainingInStep < 200 && !currentAiAudioRef.current.ended) {
                        isWaitingForAudioRef.current = true;
                        v.pause();
                    }
                }
            }
        };

        const playAiAudioForStep = (index: number) => {
            const step = rec.generatedGuide!.steps[index];
            if (!step?.audio?.audioUrl) return;

            if (currentAiAudioRef.current) currentAiAudioRef.current.pause();

            const audio = new Audio(step.audio.audioUrl);
            audio.volume = volume; // Apply current volume immediately
            currentAiAudioRef.current = audio;

            // Resume video when audio ends (if we were waiting)
            audio.onended = () => {
                if (isWaitingForAudioRef.current && v.paused) {
                    isWaitingForAudioRef.current = false;
                    v.play();
                }
            };

            audio.play().catch(e => console.warn("AI Audio Autoplay blocked", e));
        };

        const handlePause = () => {
            // Ignore pause if it's our internal sync pause
            if (isWaitingForAudioRef.current) return;

            setIsPlaying(false);
            if (audioMode === 'ai' && currentAiAudioRef.current) currentAiAudioRef.current.pause();
        };

        const handlePlay = () => {
            setIsPlaying(true);
            // Resume AI audio if we are simply resuming playback
            if (audioMode === 'ai' && currentAiAudioRef.current && currentAiAudioRef.current.paused) {
                currentAiAudioRef.current.volume = volume;
                currentAiAudioRef.current.play().catch(e => console.warn("Resume audio blocked", e));
            }
        };

        const handleSeek = () => {
            if (currentAiAudioRef.current) currentAiAudioRef.current.pause();
            lastPlayedStepRef.current = -1;
            isWaitingForAudioRef.current = false;
        };

        v.addEventListener('timeupdate', handleTimeUpdate);
        v.addEventListener('pause', handlePause);
        v.addEventListener('play', handlePlay);
        v.addEventListener('seeking', handleSeek);

        return () => {
            v.removeEventListener('timeupdate', handleTimeUpdate);
            v.removeEventListener('pause', handlePause);
            v.removeEventListener('play', handlePlay);
            v.removeEventListener('seeking', handleSeek);
        };
    }, [rec, audioMode, isPlaying]);

    const seekTo = (ms: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = ms / 1000;
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleAudioModeToggle = (mode: 'ai' | 'original') => {
        setAudioMode(mode);
        if (mode === 'original') {
            if (videoRef.current) videoRef.current.muted = false;
            if (currentAiAudioRef.current) currentAiAudioRef.current.pause();
        } else {
            if (videoRef.current) videoRef.current.muted = true;
        }
    };

    if (!rec) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>;
    const guide = rec.generatedGuide;

    return (
        <div className="animate-in fade-in duration-500">
            <button onClick={onBack} className="mb-6 text-sm text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors">
                ← Back to Library
            </button>

            <div className="flex flex-col gap-10">
                {/* 1. HERO VIDEO PLAYER */}
                <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 relative group">
                    <div className="aspect-video relative mx-auto max-w-5xl bg-black">
                        <video
                            ref={videoRef}
                            src={rec.videoUrl}
                            className="w-full h-full object-contain"
                            controls={false}
                            muted={audioMode === 'ai'}
                            onClick={() => {
                                if (videoRef.current?.paused) { videoRef.current.play(); setIsPlaying(true); }
                                else { videoRef.current?.pause(); setIsPlaying(false); }
                            }}
                        />

                        <div className="absolute top-6 right-6 flex items-center bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10 z-20">
                            <button
                                onClick={() => handleAudioModeToggle('ai')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${audioMode === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/70 hover:text-white'}`}
                            >
                                <Sparkles className="w-3 h-3" /> AI Voice
                            </button>
                            <button
                                onClick={() => handleAudioModeToggle('original')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${audioMode === 'original' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/70 hover:text-white'}`}
                            >
                                <Mic className="w-3 h-3" /> Original
                            </button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-20 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                            {/* TIMELINE TRACK */}
                            <div className="relative w-full h-8 group/timeline cursor-pointer flex items-center"
                                onClick={(e) => {
                                    if (!videoRef.current) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const p = x / rect.width;
                                    seekTo(p * videoRef.current.duration * 1000);
                                }}
                            >
                                {/* Track Background */}
                                <div className="absolute left-0 right-0 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm group-hover/timeline:h-2.5 transition-all">
                                    {/* Progress Bar */}
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-0 relative"
                                        style={{ width: videoRef.current ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%` : '0%' }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/timeline:opacity-100 transition-opacity"></div>
                                    </div>
                                </div>

                                {/* Clips / Steps Markers */}
                                {guide?.steps.map((step) => {
                                    const duration = rec.duration * 1000;
                                    const startP = (step.timestamp.startMs / duration) * 100;
                                    const widthP = ((step.timestamp.endMs - step.timestamp.startMs) / duration) * 100;

                                    return (
                                        <div
                                            key={step.stepIndex}
                                            className="absolute top-1/2 -translate-y-1/2 h-1.5 hover:h-4 hover:z-10 group-hover/timeline:h-2.5 transition-all bg-white/30 hover:bg-indigo-400/80 border-l border-white/10 first:border-0 pointer-events-none"
                                            style={{ left: `${startP}%`, width: `${widthP}%` }}
                                            title={`Step ${step.stepIndex}: ${step.instruction}`}
                                        />
                                    );
                                })}
                            </div>

                            {/* CONTROLS ROW */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => {
                                            if (videoRef.current?.paused) { videoRef.current.play(); setIsPlaying(true); }
                                            else { videoRef.current?.pause(); setIsPlaying(false); }
                                        }}
                                        className="text-white hover:text-indigo-400 transition-colors transform hover:scale-110 active:scale-95"
                                    >
                                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                                    </button>

                                    {/* Volume Control */}
                                    <div className="flex items-center gap-2 group/volume">
                                        <button
                                            onClick={() => {
                                                const newMuted = videoRef.current ? !videoRef.current.muted : false;
                                                if (videoRef.current) videoRef.current.muted = newMuted;
                                                // If unmuting and volume is 0, set to default
                                                if (!newMuted && volume === 0) setVolume(0.5);
                                                // Force re-render if needed, though state drives it usually
                                            }}
                                            className="text-white/80 hover:text-white transition-colors"
                                        >
                                            {volume === 0 || (videoRef.current?.muted) ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </button>
                                        <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 flex items-center">
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={volume}
                                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Time Display */}
                                    <div className="text-white/60 text-sm font-mono tracking-wider">
                                        {videoRef.current && Number.isFinite(videoRef.current.currentTime) ? new Date(videoRef.current.currentTime * 1000).toISOString().substr(14, 5) : "00:00"}
                                        <span className="opacity-50 mx-1">/</span>
                                        {videoRef.current && Number.isFinite(videoRef.current.duration) ? new Date(videoRef.current.duration * 1000).toISOString().substr(14, 5) : "00:00"}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
                                    <div className={`px-3 py-1 rounded-full text-xs border ${audioMode === 'ai' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200' : 'bg-white/10 border-white/20'}`}>
                                        {audioMode === 'ai' ? 'AI Voice Active' : 'Original Audio'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. CONTENT AREA */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-100 bg-gray-50/50 flex px-2 pt-2">
                        <button
                            onClick={() => setActiveTab('guide')}
                            className={`px-6 py-3 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'guide' ? 'bg-white text-indigo-600 border border-gray-100 border-b-white shadow-[0_-1px_2px_rgba(0,0,0,0.02)] -mb-px relative z-10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                        >
                            <Layout className="w-4 h-4" /> Step-by-Step Guide
                        </button>
                        <button
                            onClick={() => setActiveTab('transcript')}
                            className={`px-6 py-3 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'transcript' ? 'bg-white text-indigo-600 border border-gray-100 border-b-white shadow-[0_-1px_2px_rgba(0,0,0,0.02)] -mb-px relative z-10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                        >
                            <FileText className="w-4 h-4" /> Transcript
                        </button>
                    </div>

                    <div className="p-8 min-h-[500px]">
                        {activeTab === 'guide' ? (
                            <div className="max-w-3xl mx-auto space-y-12">
                                {guide?.steps.map((step, idx) => (
                                    <div key={step.stepIndex} id={`step-${step.stepIndex}`} className="group relative pl-8 border-l-2 border-gray-100 hover:border-indigo-200 transition-colors pb-8 last:pb-0 last:border-0">
                                        <div
                                            onClick={() => seekTo(step.timestamp.startMs)}
                                            className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white border-2 border-indigo-100 text-indigo-600 font-bold flex items-center justify-center cursor-pointer shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all hover:scale-110"
                                        >
                                            {step.stepIndex}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="cursor-pointer" onClick={() => seekTo(step.timestamp.startMs)}>
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                                    {step.instruction}
                                                </h3>
                                                <p className="text-gray-600 mt-2 leading-relaxed">
                                                    {step.audio.narrationText}
                                                </p>
                                            </div>

                                            {step.screenshotUrl && (
                                                <div
                                                    className="mt-4 rounded-xl border border-gray-100 overflow-hidden shadow-sm cursor-pointer group-hover:shadow-md transition-shadow relative"
                                                    onClick={() => seekTo(step.timestamp.startMs)}
                                                >
                                                    <img src={step.screenshotUrl} alt={`Step ${step.stepIndex}`} className="w-full h-auto bg-gray-50" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                                        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Jump to {Math.floor(step.timestamp.startMs / 1000)}s</span>
                                                    </div>
                                                </div>
                                            )}

                                            {step.audio.audioUrl && (
                                                <div className="flex items-center gap-3 mt-3 bg-gray-50 p-2 rounded-lg w-fit">
                                                    <button onClick={() => {
                                                        const a = new Audio(step.audio.audioUrl);
                                                        a.play();
                                                    }} className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                                                        <Volume2 className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI Narration</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!guide && <div className="text-center py-10 text-gray-400">Processing guide...</div>}
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Full Audio Transcript</h3>
                                <div className="prose prose-slate prose-lg">
                                    {rec.generatedGuide?.steps.map(s => (
                                        <span key={s.stepIndex} className="mr-1 hover:bg-yellow-100 cursor-pointer rounded px-0.5 transition-colors" onClick={() => seekTo(s.timestamp.startMs)}>
                                            {s.audio.rawTranscript || s.audio.narrationText}
                                        </span>
                                    ))}
                                    {(!rec.generatedGuide?.steps || rec.generatedGuide.steps.length === 0) && (
                                        <p className="text-gray-500 italic">{rec.originalTranscript || "Transcript not available."}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
