"""BiliNoteView — cloud note storage API for remote viewing."""

from __future__ import annotations

import json
import os
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("BILINOTE_VIEW_DATA_DIR", str(APP_DIR / "data" / "notes")))
PUSH_TOKEN = os.environ.get("BILINOTE_VIEW_PUSH_TOKEN", "dev-token-change-me")

app = FastAPI(title="BiliNoteView API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def auth_push(authorization: str | None = Header(default=None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    if not secrets.compare_digest(token, PUSH_TOKEN):
        raise HTTPException(status_code=403, detail="Invalid token")


def safe_task_id(task_id: str) -> str:
    tid = (task_id or "").strip()
    if not tid or "/" in tid or "\\" in tid or ".." in tid:
        raise HTTPException(status_code=400, detail="Invalid task_id")
    return tid


def note_path(task_id: str) -> Path:
    return DATA_DIR / f"{safe_task_id(task_id)}.json"


class PushNoteBody(BaseModel):
    task_id: str
    markdown: str
    video_url: str = ""
    bvid: str = ""
    title: str = ""
    platform: str = "bilibili"
    quality: str = ""
    style: str = "detailed"
    format: list[str] = Field(default_factory=list)
    model_name: str = ""
    provider_id: str = ""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    transcript_source: str = "subtitle"
    transcript: dict[str, Any] | None = None
    audio_meta: dict[str, Any] | None = None
    created_at: str | None = None


@app.on_event("startup")
def startup() -> None:
    ensure_dirs()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/notes/push")
def push_note(body: PushNoteBody, _: None = Depends(auth_push)) -> dict[str, Any]:
    if not body.markdown or not body.markdown.strip():
        raise HTTPException(status_code=400, detail="markdown is empty")
    tid = safe_task_id(body.task_id)
    created_at = body.created_at or datetime.now(timezone.utc).isoformat()
    payload = body.model_dump()
    payload["task_id"] = tid
    payload["created_at"] = created_at
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()

    path = note_path(tid)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)
    return {"code": 0, "msg": "success", "data": {"ok": True, "task_id": tid}}


def _collect_list_items() -> list[dict[str, Any]]:
    ensure_dirs()
    items: list[dict[str, Any]] = []
    for path in DATA_DIR.glob("*.json"):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(data, dict):
                continue
            items.append(
                {
                    "task_id": data.get("task_id", path.stem),
                    "title": data.get("title") or (data.get("audio_meta") or {}).get("title") or path.stem,
                    "video_url": data.get("video_url", ""),
                    "bvid": data.get("bvid", ""),
                    "platform": data.get("platform", ""),
                    "quality": data.get("quality", ""),
                    "style": data.get("style", ""),
                    "model_name": data.get("model_name", ""),
                    "prompt_tokens": data.get("prompt_tokens", 0),
                    "completion_tokens": data.get("completion_tokens", 0),
                    "total_tokens": data.get("total_tokens", 0),
                    "transcript_source": data.get("transcript_source", "subtitle"),
                    "created_at": data.get("created_at", ""),
                    "updated_at": data.get("updated_at", ""),
                    "cover_url": (data.get("audio_meta") or {}).get("cover_url", ""),
                }
            )
        except (OSError, json.JSONDecodeError):
            continue
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items


@app.get("/api/notes/list")
def list_notes() -> dict[str, Any]:
    return {"code": 0, "msg": "success", "data": _collect_list_items()}


@app.get("/api/notes/{task_id}")
def get_note(task_id: str) -> dict[str, Any]:
    path = note_path(task_id)
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Note not found")
    data = json.loads(path.read_text(encoding="utf-8"))
    return {"code": 0, "msg": "success", "data": data}


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("BILINOTE_VIEW_PORT", "8484"))
    uvicorn.run(app, host="0.0.0.0", port=port)
