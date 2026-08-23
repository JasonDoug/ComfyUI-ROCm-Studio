#!/usr/bin/env bash
# ComfyUI launcher optimized for AMD gfx1150 (Strix Point Radeon 890M/880M iGPU / APU)
# Runs native ROCm 7.14 with PyTorch 2.13 + SDPA AOTriton fused attention

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Native ROCm 7.14 Hardware Driver & Acceleration Environment Variables
export LD_PRELOAD=/opt/rocm/core-7.14/lib/libhsa-runtime64.so.1
export PYTORCH_ROCM_ARCH=gfx1150
export TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1
export HSA_ENABLE_SDMA=1

# Activate virtual environment
if [ -d "$DIR/venv" ]; then
    source "$DIR/venv/bin/activate"
fi

# Launch ComfyUI with native PyTorch SDPA cross-attention and APU memory flags
python main.py \
    --use-pytorch-cross-attention \
    --disable-pinned-memory \
    "$@"
