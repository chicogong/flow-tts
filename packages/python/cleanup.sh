#!/bin/bash
# Cleanup temporary and test files

# Remove test debug files
rm -f test_stream_debug.py

# Remove output audio files
rm -f output-*.wav
rm -f *.wav

# Remove build artifacts
rm -rf flow_tts.egg-info
rm -rf build

# Remove Python cache
find flow_tts -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
find flow_tts -type f -name "*.pyc" -delete 2>/dev/null || true

echo "✅ Cleanup complete!"
