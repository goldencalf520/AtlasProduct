#!/bin/sh
# 前台启动；平台未注入 PORT 时默认 8000，与 deploy.execution.json 的 runtime.port 保持一致
set -eu
PORT="${PORT:-8000}"
export PORT
exec node server.js
