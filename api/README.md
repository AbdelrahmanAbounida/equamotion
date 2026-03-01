# EquaMotion Render API

A FastAPI server that renders [Manim](https://www.manim.community/) animation scripts to MP4 videos.

## Prerequisites

- **Python 3.10+**
- **ffmpeg** — required by Manim for video encoding
- **LaTeX** — required by Manim for math/text rendering
- **Cairo & Pango** — required by Manim for graphics

### Install system dependencies

**macOS:**

```bash
brew install ffmpeg cairo pango
brew install --cask mactex-no-gui   # or: brew install basictex
```

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install -y ffmpeg libcairo2-dev libpango1.0-dev pkg-config python3-dev
sudo apt install -y texlive texlive-latex-extra texlive-fonts-extra
```

## Setup

```bash
cd render-api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your EQUAMOTION_API_KEY
```

## Run

```bash
# Development
python main.py

# Production
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

## API Endpoints

### `GET /`

Health check.

### `POST /render`

Render a Manim script to video.

**Headers:**

- `EQUAMOTION-API-Key`: Your API key (must match `EQUAMOTION_API_KEY` in `.env`)

**Body:**

```json
{
  "script": "from manim import *\n\nclass CircleDemo(Scene):\n    def construct(self):\n        circle = Circle(radius=2, color=BLUE)\n        self.play(Create(circle))\n        self.wait(1)",
  "scene_name": "CircleDemo",
  "quality": "medium_quality"
}
```

**Quality options:** `low_quality`, `medium_quality`, `high_quality`, `production_quality`

**Response:** MP4 video file.

## Test

```bash
curl -X POST http://localhost:8000/render \
  -H "Content-Type: application/json" \
  -H "EQUAMOTION-API-Key: your-api-key" \
  -d '{
    "script": "from manim import *\n\nclass Test(Scene):\n    def construct(self):\n        self.play(Create(Circle()))\n        self.wait(1)",
    "scene_name": "Test",
    "quality": "low_quality"
  }' \
  --output test.mp4
```
