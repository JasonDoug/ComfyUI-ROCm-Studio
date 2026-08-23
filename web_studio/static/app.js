document.addEventListener('DOMContentLoaded', () => {
    // Navigation Tabs
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Preset Aspect Ratio Buttons
    let selectedWidth = 1024;
    let selectedHeight = 1024;
    const presetButtons = document.querySelectorAll('.preset-buttons .preset-btn[data-w]');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedWidth = parseInt(btn.getAttribute('data-w'));
            selectedHeight = parseInt(btn.getAttribute('data-h'));
        });
    });

    // Image Preset Buttons (Tab 1)
    const imagePresetButtons = document.querySelectorAll('.image-btn');
    imagePresetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const presetPrompt = btn.getAttribute('data-prompt');
            const targetInput = document.getElementById('prompt-input');
            if (presetPrompt && targetInput) {
                targetInput.value = presetPrompt;
            }
        });
    });

    // Music Preset Buttons (Tab 3)
    const musicPresetButtons = document.querySelectorAll('.music-btn');
    musicPresetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const presetPrompt = btn.getAttribute('data-prompt');
            if (presetPrompt) {
                const styleInput = document.getElementById('minimax-style-prompt');
                const ttsInput = document.getElementById('tts-text-input');
                const simpleInput = document.getElementById('minimax-simple-prompt');
                const conceptInput = document.getElementById('minimax-concept-input');
                if (styleInput) styleInput.value = presetPrompt;
                if (ttsInput) ttsInput.value = presetPrompt;
                if (simpleInput) simpleInput.value = presetPrompt;
                if (conceptInput) conceptInput.value = presetPrompt;
            }
        });
    });

    // Audio & Qwen3-TTS Mode Switching
    const modeButtons = document.querySelectorAll('#tab-audio .preset-buttons .preset-btn');
    const cloningSection = document.getElementById('qwen-cloning-section');
    const designSection = document.getElementById('qwen-design-section');
    const minimaxSection = document.getElementById('minimax-multiprompt-section');
    const voiceSelect = document.getElementById('tts-voice-select');
    const audioPromptLabel = document.getElementById('audio-prompt-label');
    const musicPresetsWrapper = document.getElementById('music-presets-wrapper');

    voiceSelect.addEventListener('change', () => {
        if (voiceSelect.value.includes('minimax')) {
            minimaxSection.classList.remove('hidden');
        } else {
            minimaxSection.classList.add('hidden');
        }
    });

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.getAttribute('data-mode');

            if (mode === 'music') {
                cloningSection.classList.add('hidden');
                designSection.classList.add('hidden');
                minimaxSection.classList.remove('hidden');
                musicPresetsWrapper.classList.remove('hidden');
                audioPromptLabel.innerHTML = '<i class="fa-solid fa-music"></i> Overall Track Notes / Master Prompt';
                voiceSelect.value = 'minimax_music3_dit_fp16.safetensors';
            } else if (mode === 'tts') {
                cloningSection.classList.add('hidden');
                designSection.classList.add('hidden');
                minimaxSection.classList.add('hidden');
                musicPresetsWrapper.classList.add('hidden');
                audioPromptLabel.innerHTML = '<i class="fa-solid fa-comment"></i> Text to Synthesize (Speech)';
                voiceSelect.value = 'Qwen3-TTS-0.6B-Base';
            } else if (mode === 'clone') {
                cloningSection.classList.remove('hidden');
                designSection.classList.add('hidden');
                minimaxSection.classList.add('hidden');
                musicPresetsWrapper.classList.add('hidden');
                audioPromptLabel.innerHTML = '<i class="fa-solid fa-comment"></i> Text to Synthesize in Cloned Voice';
                voiceSelect.value = 'Qwen3-TTS-1.7B-CustomVoice';
            } else if (mode === 'design') {
                cloningSection.classList.add('hidden');
                designSection.classList.remove('hidden');
                minimaxSection.classList.add('hidden');
                musicPresetsWrapper.classList.add('hidden');
                audioPromptLabel.innerHTML = '<i class="fa-solid fa-comment"></i> Text to Synthesize';
                voiceSelect.value = 'Qwen3-TTS-1.7B-VoiceDesign';
            }
        });
    });

    // MiniMax Simple vs Studio Mode Sub-tabs
    const btnSimple = document.getElementById('minimax-tab-simple');
    const btnStudio = document.getElementById('minimax-tab-studio');
    const simpleContainer = document.getElementById('minimax-simple-container');
    const studioContainer = document.getElementById('minimax-studio-container');

    if (btnSimple && btnStudio) {
        btnSimple.addEventListener('click', () => {
            btnSimple.classList.add('active');
            btnStudio.classList.remove('active');
            simpleContainer.classList.remove('hidden');
            studioContainer.classList.add('hidden');
        });
        btnStudio.addEventListener('click', () => {
            btnStudio.classList.add('active');
            btnSimple.classList.remove('active');
            studioContainer.classList.remove('hidden');
            simpleContainer.classList.add('hidden');
        });
    }

    const durationSlider = document.getElementById('minimax-duration-slider');
    const durationVal = document.getElementById('minimax-duration-val');
    if (durationSlider && durationVal) {
        durationSlider.addEventListener('input', () => {
            durationVal.textContent = durationSlider.value + 's';
        });
    }

    // MiniMax SKILL.md Caption Rewriter Button Handler
    const rewriteBtn = document.getElementById('minimax-rewrite-btn');
    if (rewriteBtn) {
        rewriteBtn.addEventListener('click', async () => {
            const rawPrompt = document.getElementById('minimax-simple-prompt').value || document.getElementById('tts-text-input').value;
            const rawLyrics = document.getElementById('minimax-lyrics-prompt').value;

            rewriteBtn.disabled = true;
            rewriteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Rewriting Caption with SKILL.md...';

            try {
                const res = await fetch('/api/rewrite_music_prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ caption: rawPrompt, lyrics: rawLyrics })
                });

                const data = await res.json();
                if (data.status === 'success') {
                    document.getElementById('minimax-style-prompt').value = data.style_prompt;
                    document.getElementById('minimax-vocal-prompt').value = data.vocal_prompt;
                    document.getElementById('minimax-instrument-prompt').value = data.instrument_prompt;
                    document.getElementById('minimax-lyrics-prompt').value = data.lyrics_prompt;
                    document.getElementById('tts-text-input').value = data.master_prompt;

                    // Switch to Studio Mode to view rewritten fields
                    if (btnStudio) btnStudio.click();
                } else {
                    alert('Failed to rewrite caption: ' + JSON.stringify(data));
                }
            } catch (e) {
                alert('Error rewriting caption: ' + e.message);
            } finally {
                rewriteBtn.disabled = false;
                rewriteBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Apply MiniMax Music Caption Rewriter (SKILL.md)';
            }
        });
    }

    // Slider Listeners
    const stepsSlider = document.getElementById('steps-slider');
    const stepsVal = document.getElementById('steps-val');
    stepsSlider.addEventListener('input', () => stepsVal.textContent = stepsSlider.value);

    const cfgSlider = document.getElementById('cfg-slider');
    const cfgVal = document.getElementById('cfg-val');
    cfgSlider.addEventListener('input', () => cfgVal.textContent = cfgSlider.value);

    const loraSlider = document.getElementById('lora-strength-slider');
    const loraVal = document.getElementById('lora-strength-val');
    loraSlider.addEventListener('input', () => loraVal.textContent = loraSlider.value);

    // Random Seed Button
    document.getElementById('random-seed-btn').addEventListener('click', () => {
        document.getElementById('seed-input').value = Math.floor(Math.random() * 1000000000);
    });

    // Fetch Available Models
    async function loadModels() {
        try {
            const res = await fetch('/api/models');
            const data = await res.json();
            
            // Checkpoint Select
            const ckptSelect = document.getElementById('ckpt-select');
            ckptSelect.innerHTML = '';
            
            const availableCkpts = data.comfy_checkpoints.length > 0 ? data.comfy_checkpoints : data.checkpoints;
            availableCkpts.forEach(ckpt => {
                const opt = document.createElement('option');
                opt.value = ckpt;
                opt.textContent = ckpt;
                if (ckpt.includes('flux-2-klein') || ckpt.includes('klein')) {
                    opt.selected = true;
                }
                ckptSelect.appendChild(opt);
            });
            // Fallback if not selected yet
            if (!ckptSelect.value && ckptSelect.options.length > 0) {
                ckptSelect.selectedIndex = 0;
            }

            function updateModelDefaults() {
                const val = (ckptSelect.value || '').toLowerCase();
                const stepsSlider = document.getElementById('steps-slider');
                const stepsVal = document.getElementById('steps-val');
                const cfgSlider = document.getElementById('cfg-slider');
                const cfgVal = document.getElementById('cfg-val');

                if (val.includes('schnell') || val.includes('klein')) {
                    if (stepsSlider) { stepsSlider.value = 4; stepsVal.textContent = '4'; }
                    if (cfgSlider) { cfgSlider.value = 1.0; cfgVal.textContent = '1.0'; }
                } else if (val.includes('turbo') || val.includes('z-image')) {
                    if (stepsSlider) { stepsSlider.value = 8; stepsVal.textContent = '8'; }
                    if (cfgSlider) { cfgSlider.value = 2.0; cfgVal.textContent = '2.0'; }
                } else {
                    if (stepsSlider) { stepsSlider.value = 25; stepsVal.textContent = '25'; }
                    if (cfgSlider) { cfgSlider.value = 7.0; cfgVal.textContent = '7.0'; }
                }
            }

            ckptSelect.addEventListener('change', updateModelDefaults);
            updateModelDefaults();

            // Store trigger maps
            let loraTriggersMap = data.lora_triggers || {};

            // LoRA Select
            const loraSelect = document.getElementById('lora-select');
            const triggersContainer = document.getElementById('lora-triggers-container');
            const triggerBadges = document.getElementById('trigger-badges');
            const promptInput = document.getElementById('prompt-input');

            loraSelect.innerHTML = '<option value="None">None (Disabled)</option>';
            data.loras.forEach(lora => {
                const opt = document.createElement('option');
                opt.value = lora;
                opt.textContent = lora;
                loraSelect.appendChild(opt);
            });

            function updateTriggerBadges() {
                const selectedLora = loraSelect.value;
                triggerBadges.innerHTML = '';
                if (selectedLora && selectedLora !== 'None' && loraTriggersMap[selectedLora]) {
                    triggersContainer.classList.remove('hidden');
                    const tags = loraTriggersMap[selectedLora];
                    tags.forEach(tag => {
                        const chip = document.createElement('span');
                        chip.className = 'trigger-chip';
                        chip.innerHTML = `<i class="fa-solid fa-plus"></i> ${tag}`;
                        chip.title = "Click to add to prompt";
                        chip.addEventListener('click', () => {
                            if (!promptInput.value.includes(tag)) {
                                promptInput.value += (promptInput.value.trim() ? ', ' : '') + tag;
                            }
                        });
                        triggerBadges.appendChild(chip);
                    });
                } else {
                    triggersContainer.classList.add('hidden');
                }
            }

            loraSelect.addEventListener('change', updateTriggerBadges);
        } catch (e) {
            console.error("Failed to load models:", e);
        }
    }
    loadModels();

    // WebSocket Connection to ComfyUI
    const clientId = 'studio-' + Math.random().toString(36).substring(2, 9);
    let ws;

    function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/ws?clientId=${clientId}`);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleWsMessage(message);
        };

        ws.onclose = () => {
            setTimeout(connectWebSocket, 3000);
        };
    }
    connectWebSocket();

    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const genStatus = document.getElementById('gen-status');

    function handleWsMessage(msg) {
        const audioProgressBar = document.getElementById('audio-progress-bar');
        const audioProgressPercent = document.getElementById('audio-progress-percent');
        const audioProgressStatus = document.getElementById('audio-progress-status');

        if (msg.type === 'progress') {
            const value = msg.data.value;
            const max = msg.data.max;
            const percentage = Math.round((value / max) * 100);
            if (progressBar) progressBar.style.width = percentage + '%';
            if (progressText) progressText.textContent = `${percentage}% • Step ${value}/${max}`;
            if (genStatus) genStatus.textContent = `Sampling (${value}/${max} steps - ${percentage}%)`;

            if (audioProgressBar) audioProgressBar.style.width = percentage + '%';
            if (audioProgressPercent) audioProgressPercent.textContent = percentage + '%';
            if (audioProgressStatus) audioProgressStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sampling Audio (${value}/${max} steps - ${percentage}%)`;

            // Calculate ETA
            if (startTime > 0 && value > 0) {
                const elapsed = (performance.now() - startTime) / 1000;
                const secPerStep = elapsed / value;
                const remainingSec = (secPerStep * (max - value)).toFixed(1);
                const timerElem = document.getElementById('timer-text');
                if (timerElem) {
                    timerElem.textContent = `${elapsed.toFixed(1)}s • ${percentage}% (ETA ~${remainingSec}s)`;
                }
            }
        } else if (msg.type === 'executing') {
            if (msg.data.node) {
                genStatus.textContent = `Processing Node: ${msg.data.node}`;
                if (progressText && progressBar.style.width === '0%') {
                    progressText.textContent = `10% • Initializing Node ${msg.data.node}...`;
                    progressBar.style.width = '10%';
                }
                if (audioProgressStatus && audioProgressBar && audioProgressBar.style.width === '0%') {
                    audioProgressStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Executing Node ${msg.data.node}...`;
                    audioProgressBar.style.width = '10%';
                }
            } else {
                genStatus.textContent = `Generation Complete!`;
                if (progressBar) progressBar.style.width = '100%';
                if (progressText) progressText.textContent = '100% • Complete!';
                if (audioProgressBar) audioProgressBar.style.width = '100%';
                if (audioProgressPercent) audioProgressPercent.textContent = '100%';
                if (audioProgressStatus) audioProgressStatus.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #4ade80;"></i> Audio Synthesis Complete!';
            }
        }
    }

    // Real-Time HuggingFace Style Timer Functions
    let timerInterval = null;
    let startTime = 0;

    function startTimer() {
        const timerBadge = document.getElementById('hf-timer-badge');
        if (!timerBadge) return;

        timerBadge.classList.remove('hidden');
        timerBadge.style.borderColor = 'var(--accent-primary)';
        timerBadge.style.color = '#a5b4fc';
        timerBadge.innerHTML = '<i class="fa-regular fa-clock fa-spin"></i> <span id="timer-text">0.0s • Staging VRAM</span>';
        
        startTime = performance.now();
        if (timerInterval) clearInterval(timerInterval);

        if (progressText) progressText.textContent = '15% • Staging Model Weights into VRAM...';
        progressBar.style.width = '15%';

        let loadingProgress = 15;
        const initInterval = setInterval(() => {
            const currentWidth = parseInt(progressBar.style.width);
            if (!isNaN(currentWidth) && currentWidth < 24) {
                loadingProgress = Math.min(24, loadingProgress + 1);
                progressBar.style.width = loadingProgress + '%';
                if (progressText && !progressText.textContent.includes('Step')) {
                    progressText.textContent = `${loadingProgress}% • Staging Model Weights into VRAM...`;
                }
            } else {
                clearInterval(initInterval);
            }
        }, 1000);

        timerInterval = setInterval(() => {
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
            const textElem = document.getElementById('timer-text');
            if (textElem && !textElem.textContent.includes('ETA')) {
                textElem.textContent = elapsed + 's • Staging VRAM';
            }
        }, 100);
    }

    function stopTimer(success = true) {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        const timerBadge = document.getElementById('hf-timer-badge');
        if (!timerBadge) return;

        const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
        if (success) {
            timerBadge.style.borderColor = '#10b981';
            timerBadge.style.color = '#34d399';
            timerBadge.innerHTML = `<i class="fa-solid fa-check"></i> ${totalTime}s`;
        } else {
            timerBadge.style.borderColor = '#ef4444';
            timerBadge.style.color = '#f87171';
            timerBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${totalTime}s`;
        }
    }

    // Generate Button Action
    const generateBtn = document.getElementById('generate-btn');
    const canvasPlaceholder = document.querySelector('.placeholder-text');
    const resultImg = document.getElementById('result-image');
    const imageActions = document.getElementById('image-actions');
    const downloadLink = document.getElementById('download-link');

    generateBtn.addEventListener('click', async (e) => {
        if (e) e.preventDefault();
        
        let prompt = document.getElementById('prompt-input').value.trim();
        if (!prompt) {
            prompt = "A distinguished Roman senator wearing a fine white wool toga with a purple border, clean shaven with sharp classical features, standing in the marble colonnades of the 1st century Roman Forum, golden hour sunlight casting dramatic shadows, high historical detail, 8k resolution, masterpiece";
            document.getElementById('prompt-input').value = prompt;
        }

        const engineSelected = document.querySelector('input[name="inference-engine"]:checked')?.value || 'local';

        startTimer();
        generateBtn.disabled = true;
        
        if (engineSelected === 'zerogpu') {
            generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Rendering on ZeroGPU H100...';
            genStatus.textContent = "Connecting to Private ZeroGPU Space...";
            progressBar.style.width = '25%';

            const payload = {
                prompt: prompt,
                steps: parseInt(document.getElementById('steps-slider').value) || 25,
                guidance: 3.5,
                seed: Math.floor(Math.random() * 1000000000)
            };

            try {
                const response = await fetch('/api/generate_zerogpu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (data.status === 'success' && data.filename) {
                    progressBar.style.width = '100%';
                    genStatus.textContent = "ZeroGPU Generation Complete!";
                    stopTimer();

                    const imgUrl = `/api/image?filename=${encodeURIComponent(data.filename)}&subfolder=${encodeURIComponent(data.subfolder || '')}&type=output`;
                    resultImg.src = imgUrl;
                    resultImg.style.display = 'block';
                    if (canvasPlaceholder) canvasPlaceholder.style.display = 'none';

                    downloadLink.href = imgUrl;
                    downloadLink.download = data.filename;
                    imageActions.style.display = 'flex';
                } else {
                    alert("ZeroGPU Error: " + (data.detail || JSON.stringify(data)));
                    stopTimer();
                }
            } catch (err) {
                alert("ZeroGPU Error: " + err.message);
                stopTimer();
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Image';
            }
            return;
        }

        generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Rendering on GPU...';
        genStatus.textContent = "Submitting to ComfyUI...";
        progressBar.style.width = '10%';

        const ckptVal = document.getElementById('ckpt-select').value || 'flux-2-klein-4b.safetensors';

        // Auto-generate fresh random seed on every Generate click to prevent stale cache returns
        const newSeed = Math.floor(Math.random() * 1000000000);
        document.getElementById('seed-input').value = newSeed;

        const payload = {
            client_id: clientId,
            prompt: prompt,
            negative_prompt: document.getElementById('neg-prompt-input').value,
            ckpt_name: ckptVal,
            width: selectedWidth,
            height: selectedHeight,
            steps: parseInt(document.getElementById('steps-slider').value),
            cfg: parseFloat(document.getElementById('cfg-slider').value),
            sampler_name: document.getElementById('sampler-select').value,
            scheduler: document.getElementById('scheduler-select').value,
            seed: newSeed,
            lora_name: document.getElementById('lora-select').value,
            lora_strength: parseFloat(document.getElementById('lora-strength-slider').value),
            enable_upscale: document.getElementById('upscale-checkbox').checked
        };

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.status === 'success') {
                genStatus.textContent = "Rendering on GPU...";
                pollHistory(data.prompt_id);
            } else {
                stopTimer(false);
                alert('Generation error: ' + JSON.stringify(data));
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fa-solid fa-play"></i> Generate Image';
            }
        } catch (e) {
            stopTimer(false);
            alert('Server error: ' + e.message);
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fa-solid fa-play"></i> Generate Image';
        }
    });

    async function pollHistory(promptId) {
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await fetch('/api/history');
                const history = await res.json();
                if (history[promptId]) {
                    const statusObj = history[promptId].status;
                    if (statusObj && statusObj.status_str === 'error') {
                        clearInterval(interval);
                        stopTimer(false);
                        generateBtn.disabled = false;
                        generateBtn.innerHTML = '<i class="fa-solid fa-play"></i> Generate Image';
                        genStatus.textContent = "Execution Failed";
                        const errMsg = (statusObj.messages && statusObj.messages.length > 2) ? statusObj.messages[2][1].exception_message : "Runtime Error during execution.";
                        alert("ComfyUI Execution Error:\n\n" + errMsg);
                        return;
                    }

                    clearInterval(interval);
                    stopTimer(true);
                    generateBtn.disabled = false;
                    generateBtn.innerHTML = '<i class="fa-solid fa-play"></i> Generate Image';

                    const item = history[promptId];
                    if (item.status && item.status.status_str === 'error') {
                        let errMsg = 'Execution error in ComfyUI';
                        if (item.status.messages && item.status.messages.length > 0) {
                            const lastMsg = item.status.messages[item.status.messages.length - 1];
                            if (lastMsg[1] && lastMsg[1].exception_message) {
                                errMsg = lastMsg[1].exception_message;
                            }
                        }
                        genStatus.textContent = 'Execution Error!';
                        alert('ComfyUI Execution Error:\n\n' + errMsg);
                        return;
                    }

                    genStatus.textContent = "Complete!";
                    progressBar.style.width = '100%';

                    const outputs = item.outputs;
                    for (const nodeId in outputs) {
                        if (outputs[nodeId].images && outputs[nodeId].images.length > 0) {
                            const imgInfo = outputs[nodeId].images[0];
                            const imgUrl = `/api/image?filename=${encodeURIComponent(imgInfo.filename)}&subfolder=${encodeURIComponent(imgInfo.subfolder)}&type=${encodeURIComponent(imgInfo.type)}`;
                            
                            canvasPlaceholder.classList.add('hidden');
                            resultImg.src = imgUrl;
                            resultImg.classList.remove('hidden');
                            imageActions.classList.remove('hidden');
                            downloadLink.href = imgUrl;

                            addToGallery(imgUrl);
                            break;
                        }
                    }
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
            if (attempts > 120) {
                clearInterval(interval);
                generateBtn.disabled = false;
                genStatus.textContent = "Timeout waiting for output.";
            }
        }, 1500);
    }

    // Add to Gallery
    const galleryGrid = document.getElementById('gallery-grid');
    function addToGallery(url) {
        const emptyMsg = galleryGrid.querySelector('.empty-gallery');
        if (emptyMsg) emptyMsg.remove();

        const img = document.createElement('img');
        img.src = url;
        img.className = 'gallery-item';
        img.addEventListener('click', () => {
            resultImg.src = url;
            downloadLink.href = url;
        });
        galleryGrid.prepend(img);
    }

    // Vision-to-Prompt Handlers
    const visionDropzone = document.getElementById('vision-dropzone');
    const visionFileInput = document.getElementById('vision-file-input');
    const visionPreview = document.getElementById('vision-preview');

    visionDropzone.addEventListener('click', () => visionFileInput.click());
    visionFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                visionPreview.src = evt.target.result;
                visionPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    document.getElementById('analyze-image-btn').addEventListener('click', () => {
        document.getElementById('vision-result-prompt').value = "A high quality, photorealistic portrait with dramatic studio lighting, sharp focus, 8k resolution, detailed texture.";
    });

    document.getElementById('copy-to-studio-btn').addEventListener('click', () => {
        const promptText = document.getElementById('vision-result-prompt').value;
        if (promptText) {
            document.getElementById('prompt-input').value = promptText;
            document.querySelector('[data-tab="tab-image"]').click();
        }
    });

    // Music & Audio Studio Handlers
    const generateSpeechBtn = document.getElementById('generate-speech-btn');
    const audioStatusText = document.getElementById('audio-status-text');
    const audioPlayer = document.getElementById('tts-audio-player');

    if (generateSpeechBtn) {
        generateSpeechBtn.addEventListener('click', async (e) => {
            if (e) e.preventDefault();

            const activeModeBtn = document.querySelector('#tab-audio .preset-buttons .preset-btn.active');
            const currentAudioMode = activeModeBtn ? (activeModeBtn.dataset.mode || 'music') : 'music';
            const isStudioMode = document.getElementById('minimax-tab-studio') && document.getElementById('minimax-tab-studio').classList.contains('active');
            const currentMiniMaxMode = isStudioMode ? 'studio' : 'simple';

            const styleVal = document.getElementById('minimax-style-prompt') ? document.getElementById('minimax-style-prompt').value.trim() : '';
            const textInput = document.getElementById('tts-text-input') ? document.getElementById('tts-text-input').value.trim() : '';
            const simplePrompt = document.getElementById('minimax-simple-prompt') ? document.getElementById('minimax-simple-prompt').value.trim() : '';

            const text = isStudioMode 
                ? (styleVal || simplePrompt || textInput || "An uplifting track")
                : (simplePrompt || textInput || styleVal || "An uplifting track");

            const payload = {
                client_id: clientId,
                mode: currentAudioMode,
                minimax_mode: currentMiniMaxMode,
                voice: document.getElementById('tts-voice-select').value,
                text: text,
                style_prompt: document.getElementById('minimax-style-prompt').value,
                vocal_prompt: document.getElementById('minimax-vocal-prompt').value,
                instrument_prompt: document.getElementById('minimax-instrument-prompt').value,
                lyrics_prompt: document.getElementById('minimax-lyrics-prompt').value,
                duration: parseInt(document.getElementById('minimax-duration-slider').value || 60),
                ref_text: document.getElementById('qwen-ref-text') ? document.getElementById('qwen-ref-text').value : '',
                voice_description: document.getElementById('qwen-voice-description') ? document.getElementById('qwen-voice-description').value : ''
            };

            startTimer();
            generateSpeechBtn.disabled = true;
            generateSpeechBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Audio on GPU...';
            if (audioStatusText) audioStatusText.textContent = "Submitting audio request to ComfyUI...";

            const audioProgContainer = document.getElementById('audio-progress-container');
            const audioProgBar = document.getElementById('audio-progress-bar');
            const audioProgPercent = document.getElementById('audio-progress-percent');
            const audioProgStatus = document.getElementById('audio-progress-status');

            if (audioProgContainer) audioProgContainer.classList.remove('hidden');
            if (audioProgBar) audioProgBar.style.width = '5%';
            if (audioProgPercent) audioProgPercent.textContent = '5%';
            if (audioProgStatus) audioProgStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initializing Audio Model...';

            try {
                const response = await fetch('/api/generate_audio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (data.status === 'success') {
                    if (audioStatusText) audioStatusText.textContent = "Rendering audio track on GPU...";
                    pollAudioHistory(data.prompt_id);
                } else {
                    stopTimer(false);
                    generateSpeechBtn.disabled = false;
                    generateSpeechBtn.innerHTML = '<i class="fa-solid fa-play"></i> Generate Audio / Voice';
                    if (audioStatusText) audioStatusText.textContent = "Error queuing audio generation.";
                }
            } catch (err) {
                console.error("Audio generation error:", err);
                stopTimer(false);
                generateSpeechBtn.disabled = false;
                generateSpeechBtn.innerHTML = '<i class="fa-solid fa-play"></i> Generate Audio / Voice';
                if (audioStatusText) audioStatusText.textContent = "Failed to connect to server.";
            }
        });
    }

    function pollAudioHistory(promptId) {
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            const audioProgBar = document.getElementById('audio-progress-bar');
            const audioProgPercent = document.getElementById('audio-progress-percent');
            const audioProgStatus = document.getElementById('audio-progress-status');

            if (audioProgBar && audioProgBar.style.width !== '100%') {
                const estimatedPercent = Math.min(95, 10 + Math.round(attempts * 2.5));
                audioProgBar.style.width = estimatedPercent + '%';
                if (audioProgPercent) audioProgPercent.textContent = estimatedPercent + '%';
                if (audioProgStatus) audioProgStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sampling Audio on GPU (${estimatedPercent}%)...`;
            }

            try {
                const res = await fetch('/api/history');
                const history = await res.json();

                if (history[promptId]) {
                    clearInterval(interval);
                    stopTimer(true);
                    generateSpeechBtn.disabled = false;
                    generateSpeechBtn.innerHTML = '<i class="fa-solid fa-play"></i> Generate Audio / Voice';

                    if (audioProgBar) audioProgBar.style.width = '100%';
                    if (audioProgPercent) audioProgPercent.textContent = '100%';
                    if (audioProgStatus) audioProgStatus.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #4ade80;"></i> Audio Generation Complete!';

                    const item = history[promptId];
                    if (audioStatusText) audioStatusText.textContent = "Audio generation complete!";

                    const downloadContainer = document.getElementById('audio-download-container');
                    const downloadLink = document.getElementById('audio-download-link');

                    for (const nodeId in outputs) {
                        if (outputs[nodeId].audio && outputs[nodeId].audio.length > 0) {
                            const audioInfo = outputs[nodeId].audio[0];
                            const audioUrl = `/api/image?filename=${encodeURIComponent(audioInfo.filename)}&subfolder=${encodeURIComponent(audioInfo.subfolder)}&type=${encodeURIComponent(audioInfo.type)}`;
                            if (audioPlayer) {
                                audioPlayer.src = audioUrl;
                                audioPlayer.load();
                                audioPlayer.play().catch(err => console.log("Autoplay blocked by browser policy:", err));
                            }
                            if (downloadLink) {
                                downloadLink.href = audioUrl;
                                downloadLink.download = audioInfo.filename || 'generated_music.flac';
                            }
                            if (downloadContainer) {
                                downloadContainer.classList.remove('hidden');
                            }
                            break;
                        }
                    }
                }
            } catch (e) {
                console.error("Audio polling error:", e);
            }
            if (attempts > 120) {
                clearInterval(interval);
                stopTimer(false);
                generateSpeechBtn.disabled = false;
                generateSpeechBtn.innerHTML = '<i class="fa-solid fa-play"></i> Generate Audio / Voice';
                if (audioStatusText) audioStatusText.textContent = "Timeout waiting for audio output.";
            }
        }, 1500);
    }

    // Image Studio Prompt Enhancer Button Handler
    const enhanceImagePromptBtn = document.getElementById('enhance-image-prompt-btn');
    if (enhanceImagePromptBtn) {
        enhanceImagePromptBtn.addEventListener('click', async () => {
            const promptInput = document.getElementById('prompt-input');
            if (!promptInput || !promptInput.value.trim()) return;

            enhanceImagePromptBtn.disabled = true;
            enhanceImagePromptBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enhancing...';

            try {
                const response = await fetch('/api/minimax_rewrite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ caption: promptInput.value.trim() })
                });

                const data = await response.json();
                if (data.status === 'success') {
                    promptInput.value = data.style_prompt ? `${promptInput.value.trim()}, ${data.style_prompt}` : data.master_prompt;
                    enhanceImagePromptBtn.disabled = false;
                    enhanceImagePromptBtn.innerHTML = '<i class="fa-solid fa-check"></i> Enhanced!';
                    setTimeout(() => {
                        enhanceImagePromptBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Enhance Prompt';
                    }, 2500);
                } else {
                    enhanceImagePromptBtn.disabled = false;
                    enhanceImagePromptBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Enhance Prompt';
                }
            } catch (err) {
                console.error("Image prompt enhance error:", err);
                enhanceImagePromptBtn.disabled = false;
                enhanceImagePromptBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Enhance Prompt';
            }
        });
    }

    // MiniMax Music Caption Rewriter Button Handler
    const minimaxRewriteBtn = document.getElementById('minimax-rewrite-btn');
    if (minimaxRewriteBtn) {
        minimaxRewriteBtn.addEventListener('click', async () => {
            const conceptInput = document.getElementById('minimax-concept-input');
            const simplePrompt = document.getElementById('minimax-simple-prompt');
            const mainPrompt = document.getElementById('tts-text-input');
            const stylePrompt = document.getElementById('minimax-style-prompt');
            const lyricsPrompt = document.getElementById('minimax-lyrics-prompt');

            const studioContainer = document.getElementById('minimax-studio-container');
            const isStudioActive = studioContainer && !studioContainer.classList.contains('hidden');

            let textToRewrite = '';
            if (isStudioActive) {
                textToRewrite = (conceptInput && conceptInput.value.trim())
                    || (stylePrompt && stylePrompt.value.trim())
                    || (simplePrompt && simplePrompt.value.trim())
                    || (mainPrompt && mainPrompt.value.trim())
                    || '';
            } else {
                textToRewrite = (simplePrompt && simplePrompt.value.trim())
                    || (mainPrompt && mainPrompt.value.trim())
                    || (conceptInput && conceptInput.value.trim())
                    || '';
            }

            const currentLyrics = lyricsPrompt ? lyricsPrompt.value.trim() : '';

            minimaxRewriteBtn.disabled = true;
            minimaxRewriteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Rewriting via MiniMax SKILL.md...';

            try {
                const response = await fetch('/api/minimax_rewrite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        caption: textToRewrite,
                        lyrics: currentLyrics
                    })
                });

                const data = await response.json();
                if (data.status === 'success') {
                    if (document.getElementById('minimax-style-prompt')) document.getElementById('minimax-style-prompt').value = data.style_prompt;
                    if (document.getElementById('minimax-vocal-prompt')) document.getElementById('minimax-vocal-prompt').value = data.vocal_prompt;
                    if (document.getElementById('minimax-instrument-prompt')) document.getElementById('minimax-instrument-prompt').value = data.instrument_prompt;
                    if (document.getElementById('minimax-lyrics-prompt')) document.getElementById('minimax-lyrics-prompt').value = data.lyrics_prompt;
                    if (document.getElementById('main-lyrics-input')) document.getElementById('main-lyrics-input').value = data.lyrics_prompt;

                    // Switch view to Studio Mode to display all 4 generated fields
                    const studioTabBtn = document.getElementById('minimax-tab-studio');
                    if (studioTabBtn) studioTabBtn.click();

                    minimaxRewriteBtn.disabled = false;
                    minimaxRewriteBtn.innerHTML = '<i class="fa-solid fa-check"></i> Rewritten! (Switching to Studio Mode)';
                    setTimeout(() => {
                        minimaxRewriteBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Apply MiniMax Music Caption Rewriter (SKILL.md)';
                    }, 3000);
                } else {
                    minimaxRewriteBtn.disabled = false;
                    minimaxRewriteBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Apply MiniMax Music Caption Rewriter (SKILL.md)';
                }
            } catch (err) {
                console.error("MiniMax rewrite error:", err);
                minimaxRewriteBtn.disabled = false;
                minimaxRewriteBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Apply MiniMax Music Caption Rewriter (SKILL.md)';
            }
        });
    }

    // System Logs Modal Controller
    const openLogsBtn = document.getElementById('open-logs-btn');
    const closeLogsBtn = document.getElementById('close-logs-btn');
    const logsModal = document.getElementById('logs-modal');
    const logTabComfy = document.getElementById('log-tab-comfyui');
    const logTabStudio = document.getElementById('log-tab-studio');
    const refreshLogsBtn = document.getElementById('refresh-logs-btn');
    const logsConsole = document.getElementById('logs-console');
    let currentLogTarget = 'comfyui';

    async function fetchBackendLogs() {
        if (!logsConsole) return;
        logsConsole.textContent = `Fetching ${currentLogTarget}.log...`;
        try {
            const res = await fetch(`/api/logs/${currentLogTarget}?lines=150`);
            const data = await res.json();
            if (data.status === 'success' && data.lines) {
                logsConsole.textContent = data.lines.join('\n') || '[Log is empty]';
                logsConsole.scrollTop = logsConsole.scrollHeight;
            } else {
                logsConsole.textContent = data.message || `[No logs available for ${currentLogTarget}]`;
            }
        } catch (e) {
            logsConsole.textContent = `[Failed to connect to log server: ${e.message}]`;
        }
    }

    if (openLogsBtn && logsModal) {
        openLogsBtn.addEventListener('click', () => {
            logsModal.classList.remove('hidden');
            fetchBackendLogs();
        });
    }

    if (closeLogsBtn && logsModal) {
        closeLogsBtn.addEventListener('click', () => {
            logsModal.classList.add('hidden');
        });
    }

    if (logTabComfy && logTabStudio) {
        logTabComfy.addEventListener('click', () => {
            currentLogTarget = 'comfyui';
            logTabComfy.classList.add('active');
            logTabStudio.classList.remove('active');
            fetchBackendLogs();
        });
        logTabStudio.addEventListener('click', () => {
            currentLogTarget = 'studio';
            logTabStudio.classList.add('active');
            logTabComfy.classList.remove('active');
            fetchBackendLogs();
        });
    }

    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', fetchBackendLogs);
    }

    // Inline Live Console Box Poller
    let inlineLogTarget = 'comfyui';

    async function pollInlineLogs() {
        const outputs = document.querySelectorAll('.inline-log-output');
        if (!outputs || !outputs.length) return;
        try {
            const res = await fetch(`/api/logs/${inlineLogTarget}?lines=35`);
            const data = await res.json();
            if (data.status === 'success' && data.lines) {
                const cleanLines = data.lines.map(l => l.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, ''));
                const text = cleanLines.join('\n') || '[No recent log entries]';
                outputs.forEach(box => {
                    box.textContent = text;
                    box.scrollTop = box.scrollHeight;
                });
            } else if (data.message) {
                outputs.forEach(box => box.textContent = `[Log Notice: ${data.message}]`);
            }
        } catch (e) {
            console.error("Inline log fetch error:", e);
        }
    }

    document.addEventListener('click', (e) => {
        const imageBtn = e.target.closest('.image-btn');
        if (imageBtn) {
            const promptVal = imageBtn.getAttribute('data-prompt');
            const targetInput = document.getElementById('prompt-input');
            if (promptVal && targetInput) {
                targetInput.value = promptVal;
            }
        }
        const toggleBtn = e.target.closest('.toggle-log-src-btn');
        if (toggleBtn) {
            inlineLogTarget = (inlineLogTarget === 'comfyui') ? 'studio' : 'comfyui';
            document.querySelectorAll('.toggle-log-src-btn').forEach(b => b.textContent = `Target: ${inlineLogTarget}.log`);
            pollInlineLogs();
        }
        const refreshBtn = e.target.closest('.refresh-inline-log-btn');
        if (refreshBtn) {
            pollInlineLogs();
        }
    });

    // Gallery Tab & Lightbox Logic
    const galleryGrid = document.getElementById('gallery-grid');
    const refreshGalleryBtn = document.getElementById('refresh-gallery-btn');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxFilename = document.getElementById('lightbox-filename');
    const lightboxDownloadBtn = document.getElementById('lightbox-download-btn');
    const lightboxDeleteBtn = document.getElementById('lightbox-delete-btn');
    const closeLightboxBtn = document.getElementById('close-lightbox-btn');
    let currentLightboxItem = null;

    async function loadGallery() {
        if (!galleryGrid) return;
        try {
            const res = await fetch('/api/gallery');
            const data = await res.json();
            if (data.status === 'success' && data.images) {
                if (data.images.length === 0) {
                    galleryGrid.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                            <i class="fa-solid fa-images" style="font-size: 32px; margin-bottom: 12px; display: block; opacity: 0.5;"></i>
                            <p>No generated images found yet. Start generating in the AI Image Studio!</p>
                        </div>
                    `;
                    return;
                }

                galleryGrid.innerHTML = data.images.map(img => `
                    <div class="gallery-card" style="background: rgba(30,30,40,0.7); border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, border-color 0.2s;">
                        <div style="aspect-ratio: 1; overflow: hidden; background: #000; cursor: pointer; position: relative;" class="gallery-img-container" data-url="${img.url}" data-filename="${img.filename}" data-subfolder="${img.subfolder}">
                            <img src="${img.url}" alt="${img.filename}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        </div>
                        <div style="padding: 10px 12px; font-size: 11px; display: flex; flex-direction: column; gap: 4px; border-top: 1px solid rgba(255,255,255,0.05);">
                            <div style="font-weight: 600; color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${img.filename}">
                                ${img.filename}
                            </div>
                            <div style="display: flex; justify-content: space-between; color: var(--text-muted);">
                                <span><i class="fa-regular fa-clock"></i> ${img.mtime_str.split(' ')[1]}</span>
                                <span><i class="fa-solid fa-hard-drive"></i> ${img.size_mb} MB</span>
                            </div>
                            <div style="display: flex; gap: 6px; margin-top: 6px;">
                                <a href="${img.url}" download="${img.filename}" class="btn btn-secondary" style="flex: 1; padding: 4px; font-size: 11px; text-align: center;"><i class="fa-solid fa-download"></i> Save</a>
                                <button class="btn btn-secondary delete-img-btn" data-filename="${img.filename}" data-subfolder="${img.subfolder}" style="padding: 4px 8px; font-size: 11px; background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4); color: #f87171;"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (e) {
            console.error("Gallery fetch error:", e);
        }
    }

    if (refreshGalleryBtn) {
        refreshGalleryBtn.addEventListener('click', loadGallery);
    }

    // Auto-load gallery when switching to gallery tab
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.getAttribute('data-tab') === 'tab-gallery') {
                loadGallery();
            }
        });
    });

    // Lightbox & Card click delegation
    if (galleryGrid) {
        galleryGrid.addEventListener('click', async (e) => {
            const imgContainer = e.target.closest('.gallery-img-container');
            if (imgContainer) {
                const url = imgContainer.getAttribute('data-url');
                const filename = imgContainer.getAttribute('data-filename');
                const subfolder = imgContainer.getAttribute('data-subfolder');
                currentLightboxItem = { filename, subfolder, url };
                lightboxImg.src = url;
                lightboxFilename.textContent = filename;
                lightboxDownloadBtn.href = url;
                lightboxDownloadBtn.download = filename;
                lightboxModal.classList.remove('hidden');
            }

            const deleteBtn = e.target.closest('.delete-img-btn');
            if (deleteBtn) {
                const filename = deleteBtn.getAttribute('data-filename');
                const subfolder = deleteBtn.getAttribute('data-subfolder');
                if (confirm(`Delete ${filename}?`)) {
                    try {
                        const res = await fetch(`/api/gallery/delete?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}`, { method: 'DELETE' });
                        const data = await res.json();
                        if (data.status === 'success') {
                            loadGallery();
                        }
                    } catch (err) {
                        alert("Failed to delete image: " + err.message);
                    }
                }
            }
        });
    }

    if (closeLightboxBtn && lightboxModal) {
        closeLightboxBtn.addEventListener('click', () => {
            lightboxModal.classList.add('hidden');
        });
    }

    if (lightboxDeleteBtn) {
        lightboxDeleteBtn.addEventListener('click', async () => {
            if (!currentLightboxItem) return;
            if (confirm(`Delete ${currentLightboxItem.filename}?`)) {
                try {
                    const res = await fetch(`/api/gallery/delete?filename=${encodeURIComponent(currentLightboxItem.filename)}&subfolder=${encodeURIComponent(currentLightboxItem.subfolder)}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.status === 'success') {
                        lightboxModal.classList.add('hidden');
                        loadGallery();
                    }
                } catch (err) {
                    alert("Failed to delete image: " + err.message);
                }
            }
        });
    }

    // Trigger gallery refresh whenever generation completes
    window.refreshGalleryAfterGen = loadGallery;

    // Start live inline log polling immediately and every 2 seconds
    pollInlineLogs();
    setInterval(pollInlineLogs, 2000);
});
