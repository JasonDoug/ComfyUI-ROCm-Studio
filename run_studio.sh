#!/usr/bin/env bash
# Studio UI Server Launcher
# Serves the custom AI Studio UI on http://localhost:8090

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

if [ -d "$DIR/venv" ]; then
    source "$DIR/venv/bin/activate"
fi

python web_studio/studio_server.py
