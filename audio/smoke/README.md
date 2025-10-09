# Audio Smoke Test Samples

This directory contains Persian audio samples for E2E voice testing.

## Test Samples

### Generated via TTS
- `test_fa_1.wav` - "سلام، چطور می‌توانم کمک کنم؟" (Hello, how can I help you?)
- `test_fa_2.wav` - "این یک نمونه صوتی است" (This is an audio sample)
- `test_fa_3.wav` - "سیستم تشخیص گفتار فارسی" (Persian speech recognition system)

### Roundtrip Test
- `roundtrip_output.wav` - Output from full STT→LLM→TTS pipeline

## Properties
- **Sample Rate**: 16kHz
- **Channels**: Mono
- **Format**: WAV (PCM 16-bit)
- **Language**: Persian (fa-IR)

## Usage

These samples are used in:
1. **E2E Tests** (`tests/e2e/voice-e2e.spec.ts`)
2. **Manual Testing** (playback verification)
3. **CI Pipeline** (speech-e2e job)

## Generating New Samples

```bash
# Via API
curl -X POST http://localhost:3001/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"متن فارسی","lang":"fa"}' \
  --output new_sample.wav

# Via Playwright test
npm run test:e2e -- voice-e2e
```

## Verification

Run the voice E2E test suite:
```bash
npx playwright test tests/e2e/voice-e2e.spec.ts
```

Expected outcomes:
- ✅ STT route responds with Persian text
- ✅ TTS route generates WAV audio
- ✅ Full roundtrip completes without errors
- ✅ Persian characters detected in all text outputs
