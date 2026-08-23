#!/usr/bin/env bash
# ComfyUI launcher optimized for AMD gfx1150 (Strix Point Radeon 890M iGPU / APU)
# Runs native ROCm 7.14 with PyTorch 2.13 + SDPA AOTriton fused attention & Unified Memory tuning

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

# HIP Memory Allocator Tuning for Unified APU Architecture (51.5 GB RAM)
export PYTORCH_HIP_ALLOC_CONF=expandable_segments:True,garbage_collection_threshold:0.8

# Activate virtual environment
if [ -d "$DIR/venv" ]; then
    source "$DIR/venv/bin/activate"
fi

# Launch ComfyUI with PyTorch SDPA cross-attention, high VRAM caching, and APU memory flags
python main.py \
    --use-pytorch-cross-attention \
    --disable-pinned-memory \
    --highvram \
    "$@"
