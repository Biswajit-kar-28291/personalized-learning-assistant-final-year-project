import whisper

def transcribe_file(file_path: str):
    model = whisper.load_model("base")
    result = model.transcribe(file_path)

    transcript = result.get("text", "")
    segments = result.get("segments", [])
    duration = segments[-1]["end"] if segments else 0

    return transcript, segments, duration