"""Basic tests for flow-tts package."""

import flow_tts


def test_version():
    """Test that version is defined."""
    assert hasattr(flow_tts, "__version__")
    assert flow_tts.__version__ == "0.1.0"


def test_client_import():
    """Test that FlowTTS client can be imported."""
    from flow_tts import FlowTTS

    assert FlowTTS is not None


def test_types_import():
    """Test that types can be imported."""
    from flow_tts import AudioFormat, Language, TTSError, Voice

    assert AudioFormat is not None
    assert Language is not None
    assert TTSError is not None
    assert Voice is not None
