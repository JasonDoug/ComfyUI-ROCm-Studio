#!/usr/bin/env bash
# Studio UI Server Launcher
# Serves the custom AI Studio UI on http://localhost:8090

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Native ROCm 7.14 Hardware Driver & Acceleration Environment Variables
export LD_PRELOAD=/opt/rocm/core-7.14/lib/libhsa-runtime64.so.1
export PYTORCH_ROCM_ARCH=gfx1150
export ROCM_PATH=/opt/rocm/core-7.14
export HIP_VISIBLE_DEVICES=0

# AOTriton & MIOpen Fused Attention Acceleration
export TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1
export HSA_ENABLE_SDMA=1
export AMD_DISABLE_HSA_P2P=1
export MIOPEN_FIND_ENFORCE=3

# HIP Memory Allocator Tuning for Unified APU Architecture
export PYTORCH_HIP_ALLOC_CONF=expandable_segments:True,garbage_collection_threshold:0.8

# HuggingFace Centralized Model Storage Configuration
export HF_HOME="/home/jason/models/HF-Hub"
export HF_HUB_CACHE="/home/jason/models/HF-Hub/models"

if [ -d "$DIR/venv" ]; then
    source "$DIR/venv/bin/activate"
fi

python -u web_studio/studio_server.py 2>&1 | tee -a studio.log
