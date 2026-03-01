import os
import uuid
import tempfile
import shutil
import subprocess

from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.responses import FileResponse
from fastapi.security import APIKeyHeader
from starlette.background import BackgroundTask
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("EQUAMOTION_API_KEY", "")

api_key_header = APIKeyHeader(name="EQUAMOTION-API-Key")


async def verify_api_key(key: str = Security(api_key_header)):
    if not API_KEY or key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return key


app = FastAPI(title="Equamotion API", dependencies=[Depends(verify_api_key)])

VENV_MANIM = os.path.join(os.path.dirname(os.path.abspath(__file__)), "venv", "bin", "manim")
MANIM = VENV_MANIM if os.path.exists(VENV_MANIM) else "manim"


QUALITY_MAP = {
    "low_quality": "l",
    "medium_quality": "m",
    "high_quality": "h",
    "production_quality": "p",
}


class ScriptRequest(BaseModel):
    script: str
    scene_name: str
    quality: str = "medium_quality"  # low_quality, medium_quality, high_quality, production_quality


@app.get("/")
async def root():
    return {"message": "Welcome to Equamotion API"}


@app.post("/render")
async def render_manim(req: ScriptRequest):
    job_id = str(uuid.uuid4())
    tmpdir = os.path.join(tempfile.gettempdir(), f"equamotion_{job_id}")
    os.makedirs(tmpdir, exist_ok=True)

    script_path = os.path.join(tmpdir, "scene.py")
    with open(script_path, "w") as f:
        f.write(req.script)

    try:
        result = subprocess.run(
            [
                MANIM, "render",
                "-q", QUALITY_MAP.get(req.quality, "m"),
                "--media_dir", tmpdir,
                script_path,
                req.scene_name,
            ],
            capture_output=True,
            text=True,
            timeout=300,
        )

        if result.returncode != 0:
            shutil.rmtree(tmpdir, ignore_errors=True)
            raise HTTPException(status_code=400, detail=result.stderr)

        # Find the rendered video
        for root_dir, _, files in os.walk(tmpdir):
            for file in files:
                if file.endswith(".mp4"):
                    video_path = os.path.join(root_dir, file)
                    return FileResponse(
                        path=video_path,
                        media_type="video/mp4",
                        filename=f"{req.scene_name}.mp4",
                        background=BackgroundTask(shutil.rmtree, tmpdir, True),
                    )

        shutil.rmtree(tmpdir, ignore_errors=True)
        raise HTTPException(status_code=500, detail="Video not found after render")

    except subprocess.TimeoutExpired:
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise HTTPException(status_code=408, detail="Render timed out")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_excludes=["tmp/*"],
    )
