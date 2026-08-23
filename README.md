# BiliNoteView

精简版 BiliNote 前端 + 云端笔记 API：用于在 `https://nineee.xyz/bilinote/view/` 浏览本机自动总结同步上来的笔记。

## 结构

- `frontend/` — 仅保留「生成历史 + 主展示区」（无左侧新建/生成栏）
- `server/` — FastAPI，接收本机 BiliNote 后端 push、对外提供列表/详情 API

## 本机配置

在 `fast-summary/user.env`（合并进 BiliNote `backend/.env`）：

```env
BILINOTE_VIEW_PUSH_URL=https://nineee.xyz/api/bilinote/view/api/notes/push
BILINOTE_VIEW_PUSH_TOKEN=<与服务器相同>
NOTE_DEFAULT_STYLE=detailed
```

## 远端部署

```powershell
python .cursor\skills\deploy-frontend-remote\scripts\deploy-view.py
```

需先在 `deploy-frontend-remote/user.env` 配置 `BILINOTE_VIEW_PUSH_TOKEN`、`REMOTE_VIEW_WEB_ROOT` 等。
