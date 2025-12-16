
export const MockService = {
    /**
     * Generates a fallback guide when AI is unavailable.
     * @param {Array} events - List of recorded events
     * @param {number} videoDuration - Total duration in seconds
     * @returns {Object} - The Guide JSON
     */
    generateMockGuide(events, videoDuration) {
        if (!events || events.length === 0) return {
            videoMeta: { durationMs: videoDuration * 1000, resolution: { width: 1920, height: 1080 }, frameRate: 30 },
            steps: [], timelineIndex: [], processedAt: new Date().toISOString()
        };

        const steps = events.filter(e => e.type === 'click' || e.type === 'navigation').map((e, i) => {
            const startMs = e.timestamp;
            // End time is the next event's timestamp, or end of video
            // If next event is > 5 sec away, cap step at 5 sec to avoid boring static pauses
            const nextTimestamp = events[i + 1]?.timestamp || (videoDuration * 1000);
            const nominalEnd = Math.min(nextTimestamp, startMs + 5000);
            const endMs = startMs < nextTimestamp ? nominalEnd : nextTimestamp;

            return {
                stepIndex: i + 1,
                eventType: e.type,
                title: `Action: ${e.type}`,
                instruction: `${e.type === 'navigation' ? 'Navigate to' : 'Click on'} Item`,
                timestamp: { startMs, endMs },
                audio: {
                    chunkId: `audio_${i}`,
                    rawTranscript: "Mock transcript segment.",
                    narrationText: `Action ${i + 1}.`
                },
                coordinates: { x: 0, y: 0, width: 0, height: 0 },
                zoom: null
            };
        });

        return {
            videoMeta: { durationMs: videoDuration * 1000, resolution: { width: 1920, height: 1080 }, frameRate: 30 },
            steps: steps,
            timelineIndex: [],
            processedAt: new Date().toISOString()
        };
    }
};
