# 🎨 ComfyUI ROCm Studio — AMD APU & AI Creation Suite

An optimized, full-featured AI Web Studio and execution engine built on **ComfyUI**, custom-tailored for high-performance AI generation on **AMD ROCm 7.14**, **RDNA 3.5 APUs (Radeon 890M / Ryzen AI 9 HX 370)**, **FLUX.1 GGUF** models, and **MiniMax Music 0.1 / ACE Step** audio generation.

---

## 🌟 Key Features & Customizations

### 🎛️ 1. Web Studio Interface (`http://localhost:8090`)
* **3-Column Studio Layout**: Clean, responsive tabbed creation suite for Image Generation, Audio Production, and Prompt Enhancement.
* **Expandable Multi-Line Textareas**: Dynamic input controls for prompt, style, vocal specifications, arrangement timelines, and song lyrics.
* **Real-Time Audio Progress & FLAC Export**: Live WebSocket progress indicator (`0%` to `100%`) for MiniMax audio sampling with built-in `.flac` track downloader.

### 🎵 2. Universal Song Lyrics Engine (LRCLIB Integration)
* **Real-Time Lyrics Search**: Type any song title or prompt into the concept input and the backend automatically queries the open LRCLIB database to retrieve verbatim lyrics.
* **Auto MiniMax Tagging**: Formats retrieved lyrics into MiniMax music section tags (`[Intro]`, `[Verse 1]`, `[Chorus]`, `[Verse 2]`, `[Outro]`).

### 🖼️ 3. Advanced FLUX GGUF & LoRA Support
* **FLUX.1-dev GGUF Integration**: Full support for quantized GGUF image generation models (`flux1-dev-Q4_0.gguf`).
* **Automatic LoRA Trigger Word Detection**: Scans safetensors header metadata and displays clickable trigger badges (e.g. `class1cpa1nt` for Classic Painting FLUX).

### ⚡ 4. AMD ROCm 7.14 Hardware Optimizations
Tailored for **AMD Ryzen AI 9 HX 370 APU / Radeon 890M (`gfx1150`)** with **51.5 GB LPDDR5X Unified Memory**:
* **PyTorch 2.13 SDPA AOTriton Fused Cross-Attention**: Direct kernel dispatch for matrix math (`TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1` & `MIOPEN_FIND_ENFORCE=3`).
* **PyTorch Segment Expansion**: Eliminates memory fragmentation with `PYTORCH_HIP_ALLOC_CONF` & `PYTORCH_CUDA_ALLOC_CONF` (`expandable_segments:True,garbage_collection_threshold:0.8`).
* **HSA Hardware SDMA Direct Transfers**: Enables `libhsa-runtime64.so.1` system direct memory access (`HSA_ENABLE_SDMA=1`).

### 🧠 5. Dynamic Model Lifecycle Caching (Smart VRAM Strategy)
* **Least Recently Used (LRU) Model Eviction**: Active models (FLUX.1 GGUF, Klein, Juggernaut XL, MiniMax Audio) remain **100% resident in VRAM** during consecutive runs, guaranteeing instant zero-reload generations.
* **Context-Aware Dynamic Swapping**: Automatically evicts inactive model weights when switching creation contexts (e.g., Image Studio ↔ Music Studio or switching checkpoint families), preventing PyTorch allocation pool fragmentation and OOM errors.
* **Segment Expansion**: PyTorch ROCm allocation pools dynamically expand to accommodate high-resolution VAE decodes seamlessly.

### 📁 6. Centralized Model Repository & HuggingFace Storage
* **Centralized Location**: `HF_HOME="/home/jason/models/HF-Hub"` and `HF_HUB_CACHE="/home/jason/models/HF-Hub/models"`.
* **Universal Model Scanning**: All downloaded checkpoints, LoRAs, text encoders, and GGUFs are automatically stored and scanned from the central `/home/jason/models/` directory structure.
* **Segment Expansion**: PyTorch ROCm allocation pools dynamically expand to accommodate high-resolution VAE decodes seamlessly.

---

## 🚀 Quick Start

### 1. Launch ComfyUI Backend
```bash
./run_comfyui.sh
```
Runs the accelerated backend on `http://127.0.0.1:8188`.

### 2. Launch Web Studio Interface
```bash
./run_studio.sh
```
Serves the custom Web Studio on `http://localhost:8090`.

---

## 📁 Repository Structure

```
├── run_comfyui.sh          # Accelerated ComfyUI launcher script with ROCm 7.14 flags
├── run_studio.sh           # Web Studio server launcher script
├── web_studio/
│   ├── studio_server.py    # FastAPI server, LRCLIB lyrics lookup, model discovery
│   └── static/
│       ├── index.html      # Responsive 3-column Web Studio interface
│       ├── app.js          # Client event handlers, WebSocket progress & audio player wiring
│       └── style.css       # Studio dark theme stylesheet
├── comfy/                  # Core ComfyUI tensor engine & MiniMax/ACE audio patches
├── comfy_extras/           # ACE Step 1.5 music nodes
└── custom_nodes/           # GGUF model loader & custom extensions
```

---

## 📄 License
This project inherits the core ComfyUI GPL-3.0 license.
