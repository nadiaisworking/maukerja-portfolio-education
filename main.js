document.addEventListener('DOMContentLoaded', () => {
    const gameView = document.getElementById('game-view');
    const contentView = document.getElementById('content-view');
    const formView = document.getElementById('form-view');
    const bubblesContainer = document.getElementById('bubbles-container');
    const dropZone = document.getElementById('drop-zone');
    const pocketContent = document.getElementById('pocket-content');

    let collectedCount = 0;
    const totalItems = 5;
    const items = [
        { icon: '📜', label: 'Sijil' },
        { icon: '🚀', label: 'Projek' },
        { icon: '📰', label: 'Artikel' },
        { icon: '🖼️', label: 'Imej' },
        { icon: '🎬', label: 'Video' }
    ];

    // Inject bubbles into the ROW
    items.forEach((item, index) => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble-item';
        bubble.innerHTML = `
            <div class="bubble-circle">${item.icon}</div>
            <div class="bubble-label">${item.label}</div>
        `;
        bubble.style.animationDelay = `${index * 0.2}s`;

        initDrag(bubble);
        bubblesContainer.appendChild(bubble);
    });

    function initDrag(el) {
        let isDragging = false;
        let startX, startY;
        let originalParent = el.parentElement;
        let placeholder = null; // To hold the space

        el.addEventListener('mousedown', start);
        el.addEventListener('touchstart', start, { passive: false });

        function start(e) {
            isDragging = true;
            const pos = e.type === 'touchstart' ? e.touches[0] : e;

            // Get initial offset before changing position to fixed
            const rect = el.getBoundingClientRect();
            startX = pos.clientX - rect.left;
            startY = pos.clientY - rect.top;

            // Create placeholder
            placeholder = document.createElement('div');
            placeholder.style.width = `${rect.width}px`;
            placeholder.style.height = `${rect.height}px`;
            placeholder.style.flex = '0 0 auto'; // Prevent flex shrinking
            placeholder.style.pointerEvents = 'none'; // Don't interfere
            // Copy margins if necessary, though simple flex gap might handle it. 
            // Computed style check is safer.
            const style = window.getComputedStyle(el);
            placeholder.style.margin = style.margin;
            placeholder.style.visibility = 'hidden'; // invisible

            // Insert placeholder before setting fixed
            el.parentElement.insertBefore(placeholder, el);

            el.style.width = `${rect.width}px`;
            el.style.position = 'fixed';
            el.style.left = `${rect.left}px`;
            el.style.top = `${rect.top}px`;
            el.style.zIndex = 1000;
            el.style.animation = 'none';

            document.addEventListener('mousemove', move);
            document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('mouseup', stop);
            document.addEventListener('touchend', stop);
        }

        function move(e) {
            if (!isDragging) return;
            e.preventDefault();
            const pos = e.type === 'touchmove' ? e.touches[0] : e;
            el.style.left = `${pos.clientX - startX}px`;
            el.style.top = `${pos.clientY - startY}px`;
        }

        function stop() {
            isDragging = false;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('mouseup', stop);
            document.removeEventListener('touchend', stop);

            // Remove placeholder
            if (placeholder && placeholder.parentElement) {
                placeholder.remove();
                placeholder = null;
            }

            const rectEl = el.getBoundingClientRect();
            const rectTarget = dropZone.getBoundingClientRect();

            const isOverlap = !(rectEl.right < rectTarget.left ||
                rectEl.left > rectTarget.right ||
                rectEl.bottom < rectTarget.top ||
                rectEl.top > rectTarget.bottom);

            if (isOverlap) {
                // SUCCESS
                el.style.transition = 'all 0.3s ease-out';
                el.style.transform = 'scale(0)';
                el.style.opacity = '0';

                // Add mini icon to pocket
                const icon = el.querySelector('.bubble-circle').innerText;
                const mini = document.createElement('div');
                mini.className = 'mini-icon';
                mini.innerText = icon;
                pocketContent.appendChild(mini);

                setTimeout(() => el.remove(), 300);
                collectedCount++;
                if (collectedCount >= totalItems) {
                    setTimeout(switchView, 800);
                }
            } else {
                // RETURN TO ROW
                el.style.transition = 'all 0.4s ease';
                el.style.position = '';
                el.style.left = '';
                el.style.top = '';
                el.style.width = '';
                setTimeout(() => {
                    el.style.transition = '';
                    el.style.animation = 'softFloat 3s ease-in-out infinite';
                }, 400);
            }
        }
    }

    function switchView() {
        gameView.classList.remove('active');
        gameView.classList.add('off-top');
        contentView.classList.add('active');
    }

    document.getElementById('cta-hadiah')?.addEventListener('click', () => {
        contentView.classList.remove('active');
        contentView.classList.add('off-top');
        formView.classList.add('active');
    });

    // Handle Form Submission
    const portfolioForm = document.getElementById('portfolio-form');
    const whatsappModal = document.getElementById('whatsapp-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const submitBtn = portfolioForm.querySelector('button[type="submit"]');

    if (portfolioForm) {
        portfolioForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // 1. Loading State
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sedang Hantar...';
            submitBtn.disabled = true;

            // 2. Simulate Network Request (1.5 seconds)
            setTimeout(() => {
                // 3. Success Action

                // SHOW MODAL FIRST to ensure it's visible before we rip out the active form
                if (whatsappModal) {
                    whatsappModal.classList.add('active');
                }

                // Hide the submission area (Visual Reset)
                if (submissionArea) submissionArea.style.display = 'none';

                // Reset the form
                portfolioForm.reset();

                // Reset file input label
                if (fileNameDisplay) fileNameDisplay.innerText = 'Tiada file dipilih';
                if (changeFileBtn) changeFileBtn.style.display = 'none';

                // Reset Specific Fields Visibility
                const allSpecifics = document.querySelectorAll('[id$="-specific-fields"]');
                allSpecifics.forEach(el => el.style.display = 'none');

                // Reset Image Preview if exists
                if (imagePreview) {
                    imagePreview.src = '';
                    if (imageUploadFrame) imageUploadFrame.style.display = 'none';
                }

                // Reset Video Preview if exists
                const videoPreview = document.getElementById('video-preview-container');
                const videoFrame = document.getElementById('video-preview-frame');
                if (videoPreview) videoPreview.style.display = 'none';
                if (videoFrame) videoFrame.src = '';

                // Restore Button (for next time)
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;

            }, 1500);
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function () {
            if (whatsappModal) whatsappModal.classList.remove('active');
        });
    }

    // Close modal if clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === whatsappModal) {
            whatsappModal.classList.remove('active');
        }
    });

    // NEW: Handle Folder Click & File Upload
    // NEW: Handle Folder Click & File Upload
    window.triggerUpload = function (category) {
        const categoryInput = document.getElementById('selected-category');
        const fileInput = document.getElementById('hidden-file-input');
        const submissionArea = document.getElementById('submission-area');
        const fileInputGroup = document.getElementById('hidden-file-input')?.closest('.form-group');

        // Define mapping of category to specific field container ID
        const categoryFieldsMap = {
            'Imej': 'image-specific-fields',
            'Video': 'video-specific-fields',
            'Projek': 'website-specific-fields', // 'Projek' is the category value for Website
            'Dokumen': 'document-specific-fields'
        };

        if (categoryInput) {
            categoryInput.value = category;

            // 1. Reset all specific field containers
            Object.values(categoryFieldsMap).forEach(id => {
                const container = document.getElementById(id);
                if (container) {
                    container.style.display = 'none';
                    // Remove required from all inputs inside hidden containers
                    const inputs = container.querySelectorAll('input, textarea, select');
                    inputs.forEach(input => input.required = false);
                }
            });

            // 2. Show active container and make its fields REQUIRED
            const activeId = categoryFieldsMap[category];
            const activeContainer = document.getElementById(activeId);
            if (activeContainer) {
                activeContainer.style.display = 'block';
                const inputs = activeContainer.querySelectorAll('input, textarea, select');
                inputs.forEach(input => input.required = true);
            }

            // 3. Handle File Input Visibility & Requirement
            // Image & Document need file upload. Video & Website do not (they have links).
            if (category === 'Imej' || category === 'Dokumen') {
                if (fileInputGroup) fileInputGroup.style.display = 'block';
                if (fileInput) {
                    fileInput.required = true;
                    // Set specific accept types
                    if (category === 'Imej') {
                        fileInput.accept = '.jpg, .jpeg, .png';
                    } else {
                        fileInput.accept = '.pdf'; // Strict PDF only
                    }

                    // Reset value to ensure 'change' event fires even if same file is selected again
                    fileInput.value = '';


                    // Trigger click only if no file selected yet? 
                    // Or always trigger to let them choose? 
                    // Expected behavior: clicking folder opens file dialog.
                    fileInput.click();
                }
            } else {
                // Video or Website
                if (fileInputGroup) fileInputGroup.style.display = 'none';
                if (fileInput) {
                    fileInput.required = false;
                    fileInput.value = ''; // Clear file if switching to non-file category
                }
            }

            // 4. Show Submission Area
            if (submissionArea) {
                submissionArea.style.display = 'block';
                // Scroll to it
                setTimeout(() => {
                    submissionArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    };

    // YOUTUBE PREVIEW LOGIC
    const youtubeInput = document.getElementById('youtube-link-input');
    const videoPreviewContainer = document.getElementById('video-preview-container');
    const videoPreviewFrame = document.getElementById('video-preview-frame');

    if (youtubeInput && videoPreviewFrame) {
        youtubeInput.addEventListener('input', (e) => {
            const url = e.target.value;
            // Regex to extract video ID (supports standard v= and short youtu.be/)
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);

            if (match && match[2].length === 11) {
                const videoId = match[2];
                videoPreviewFrame.src = `https://www.youtube.com/embed/${videoId}`;
                if (videoPreviewContainer) videoPreviewContainer.style.display = 'block';
            } else {
                if (videoPreviewContainer) videoPreviewContainer.style.display = 'none';
                videoPreviewFrame.src = '';
            }
        });
    }

    // NEW: Show Form after File Selection
    const hiddenFileInput = document.getElementById('hidden-file-input');
    const submissionArea = document.getElementById('submission-area');
    const fileNameDisplay = document.getElementById('file-name-display');

    if (hiddenFileInput) {
        const changeFileBtn = document.getElementById('change-file-btn');

        const imageSpecificFields = document.getElementById('image-specific-fields');
        const documentSpecificFields = document.getElementById('document-specific-fields');

        // Change File Button Logic
        if (changeFileBtn) {
            changeFileBtn.addEventListener('click', () => {
                hiddenFileInput.value = ''; // Reset to allow re-selecting same file
                hiddenFileInput.click();
            });
        }

        if (hiddenFileInput) {
            hiddenFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const fileName = file.name;
                    const fileSize = file.size; // in bytes
                    const category = document.getElementById('selected-category').value;
                    let isValid = true;
                    let errorMessage = '';

                    // 1. VALIDATION LOGIC
                    if (category === 'Dokumen') {
                        // Check Type (PDF only)
                        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                            isValid = false;
                            errorMessage = 'Harap maaf. Sila muat naik fail dalam format PDF sahaja.';
                        }
                        // Check Size (Max 2MB)
                        else if (fileSize > 2 * 1024 * 1024) {
                            isValid = false;
                            errorMessage = 'Saiz fail terlalu besar. Sila pastikan fail anda bawah 2MB.';
                        }
                    }
                    else if (category === 'Imej') {
                        // Check Size (Max 2MB)
                        if (fileSize > 2 * 1024 * 1024) {
                            isValid = false;
                            errorMessage = 'Maaf, saiz file gambar mestilah kurang daripada 2MB.';
                        }
                        // Check Type
                        else {
                            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                            if (!validTypes.includes(file.type)) {
                                isValid = false;
                                errorMessage = 'Hanya format JPG dan PNG dibenarkan untuk Gambar.';
                            }
                        }
                    }

                    // 2. HANDLE VALIDATION RESULT
                    if (!isValid) {
                        alert(errorMessage);
                        hiddenFileInput.value = ''; // Clear input to allow retry

                        // RECOVERABILITY: Keep the UI in a state where user can try again
                        fileNameDisplay.innerText = 'Tiada file dipilih';
                        changeFileBtn.style.display = 'inline-block'; // Show 'Change' button so they can retry
                        changeFileBtn.innerText = 'Pilih Fail Semula'; // Rename to 'Retry'

                        // Hide specific fields
                        if (imageSpecificFields) imageSpecificFields.style.display = 'none';
                        if (documentSpecificFields) documentSpecificFields.style.display = 'none';

                        return; // Stop processing
                    }

                    // 3. SUCCESS STATE
                    // Update Name Display
                    if (fileNameDisplay) {
                        fileNameDisplay.innerText = file.name;
                        fileNameDisplay.style.color = '#333';
                    }

                    // Show Change Button (Restored to normal text)
                    if (changeFileBtn) {
                        changeFileBtn.style.display = 'inline-block';
                        changeFileBtn.innerText = 'Tukar';
                    }

                    // Show Submission Area
                    if (submissionArea) {
                        submissionArea.style.display = 'block';
                        // Small delay to ensure display is rendered before scrolling
                        setTimeout(() => {
                            submissionArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                    }

                    // 4. SHOW CATEGORY SPECIFIC FIELDS & PREVIEWS
                    if (category === 'Imej') {
                        if (imageSpecificFields) imageSpecificFields.style.display = 'block';
                        if (documentSpecificFields) documentSpecificFields.style.display = 'none';

                        // Display Preview
                        const imagePreview = document.getElementById('image-preview');
                        const imageUploadFrame = document.querySelector('.image-upload-frame');
                        const imageSliderContainer = document.getElementById('image-slider-container');
                        const imageSlider = document.getElementById('image-position-slider');

                        if (imagePreview) {
                            // Reset everything first
                            imagePreview.src = '';
                            if (imageUploadFrame) imageUploadFrame.style.display = 'none';
                            if (imageSliderContainer) imageSliderContainer.style.display = 'none';

                            if (file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = function (e) {
                                    imagePreview.src = e.target.result;
                                    if (imageUploadFrame) imageUploadFrame.style.display = 'flex';

                                    // Reset Slider logic moved to imagePreview.onload to handle contain/cover logic
                                    if (imageSliderContainer) imageSliderContainer.style.display = 'block';
                                }
                                reader.readAsDataURL(file);
                            }
                        }
                    } else if (category === 'Dokumen') {
                        if (documentSpecificFields) documentSpecificFields.style.display = 'block';
                        if (imageSpecificFields) imageSpecificFields.style.display = 'none';
                    } else {
                        if (imageSpecificFields) imageSpecificFields.style.display = 'none';
                        if (documentSpecificFields) documentSpecificFields.style.display = 'none';
                    }

                    // Slider Logic (Idempotent check/add)
                    // Slider & Drag Logic (Constrained)
                    if (imageSlider && imagePreview && imageUploadFrame && !imageSlider.hasAttribute('data-listener-attached')) {

                        let scale = 1;
                        let pointX = 0;
                        let pointY = 0;
                        let startX = 0;
                        let startY = 0;
                        let isDragging = false;

                        // Dimensions
                        const FRAME_WIDTH = 296;
                        const FRAME_HEIGHT = 221;
                        const BUFFER = 2; // Extra pixels to ensure overlap and no white space
                        let baseWidth = 0;
                        let baseHeight = 0;

                        // Calculate setup when image loads
                        imagePreview.onload = function () {
                            const imgWidth = imagePreview.naturalWidth;
                            const imgHeight = imagePreview.naturalHeight;

                            // 1. Calculate Scale to CONTAIN image within frame
                            // We want the image to be fully visible by default.
                            const scaleX = FRAME_WIDTH / imgWidth;
                            const scaleY = FRAME_HEIGHT / imgHeight;
                            const scaleContain = Math.min(scaleX, scaleY);

                            // 2. Calculate Scale to COVER frame (for max zoom consideration)
                            const scaleCover = Math.max(scaleX, scaleY);

                            // Apply Contain Scale
                            baseWidth = imgWidth * scaleContain;
                            baseHeight = imgHeight * scaleContain;

                            imagePreview.style.width = `${baseWidth}px`;
                            imagePreview.style.height = `${baseHeight}px`;

                            // 3. Reset State
                            scale = 1; // Current scale relative to base dimensions
                            pointX = 0;
                            pointY = 0;
                            imageSlider.value = 1;

                            // 4. Set Slider Max to allow zooming up to Cover + extra
                            // If we are at Contain (1x), we need to reach Cover.
                            // relativeCoverScale = scaleCover / scaleContain
                            // We give a bit more room (e.g. 1.5x cover or just fixed max)
                            // Let's make max dynamic or fixed large enough. 
                            // If Image is huge, scaleContain is small. 
                            // If Image is small, scaleContain is large. 
                            // The base dimensions are set to FIT the frame.
                            // So baseWidth <= FRAME_WIDTH and baseHeight <= FRAME_HEIGHT.
                            // To Cover, we need to scale up.

                            const relativeCover = scaleCover / scaleContain;
                            // Set max to at least relativeCover * 1.5 to allow freedom
                            const newMax = Math.max(3, relativeCover * 1.5);
                            imageSlider.max = newMax;

                            updateTransform();
                        };

                        // Helper to clamp values
                        function clamp(value, min, max) {
                            return Math.min(Math.max(value, min), max);
                        }

                        function getLimits() {
                            const currentWidth = baseWidth * scale;
                            const currentHeight = baseHeight * scale;

                            // Calculate excess dimension
                            // If content is smaller than frame, excess is 0.
                            const excessX = Math.max(0, currentWidth - FRAME_WIDTH);
                            const excessY = Math.max(0, currentHeight - FRAME_HEIGHT);

                            return {
                                x: excessX / 2,
                                y: excessY / 2
                            };
                        }

                        // Zoom Slider
                        imageSlider.addEventListener('input', (e) => {
                            scale = parseFloat(e.target.value);
                            // Re-clamp current position if we zoom out
                            const limits = getLimits();

                            // If zoomed out where image is smaller than frame, pointX/Y should be 0 (center)
                            // The clamping handles this because limits will be 0, so clamps to 0.
                            pointX = clamp(pointX, -limits.x, limits.x);
                            pointY = clamp(pointY, -limits.y, limits.y);
                            updateTransform();
                        });

                        function updateTransform() {
                            imagePreview.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
                        }

                        // Drag Events (Mouse)
                        imageUploadFrame.addEventListener('mousedown', (e) => {
                            e.preventDefault();
                            startX = e.clientX - pointX;
                            startY = e.clientY - pointY;

                            const limits = getLimits();
                            // ONLY start dragging if movement is possible
                            if (limits.x > 0 || limits.y > 0) {
                                isDragging = true;
                                imageUploadFrame.style.cursor = 'grabbing';
                            }
                        });

                        window.addEventListener('mousemove', (e) => {
                            if (!isDragging) return;
                            e.preventDefault();

                            let newX = e.clientX - startX;
                            let newY = e.clientY - startY;

                            const limits = getLimits();
                            pointX = clamp(newX, -limits.x, limits.x);
                            pointY = clamp(newY, -limits.y, limits.y);

                            updateTransform();
                        });

                        window.addEventListener('mouseup', () => {
                            isDragging = false;
                            // Only reset if we were allowed to drag
                            const limits = getLimits();
                            if (limits.x > 0 || limits.y > 0) {
                                imageUploadFrame.style.cursor = 'grab';
                            } else {
                                imageUploadFrame.style.cursor = 'default'; // Or grab if still potentially zoomable
                            }
                            // Simplified: Just reset to grab (assuming user might zoom in later)
                            imageUploadFrame.style.cursor = 'grab';
                        });

                        // Drag Events (Touch)
                        imageUploadFrame.addEventListener('touchstart', (e) => {
                            if (e.touches.length === 1) {
                                e.preventDefault();
                                startX = e.touches[0].clientX - pointX;
                                startY = e.touches[0].clientY - pointY;

                                const limits = getLimits();
                                if (limits.x > 0 || limits.y > 0) {
                                    isDragging = true;
                                }
                            }
                        }, { passive: false });

                        window.addEventListener('touchmove', (e) => {
                            if (!isDragging) return;
                            e.preventDefault();

                            let newX = e.touches[0].clientX - startX;
                            let newY = e.touches[0].clientY - startY;

                            const limits = getLimits();
                            pointX = clamp(newX, -limits.x, limits.x);
                            pointY = clamp(newY, -limits.y, limits.y);

                            updateTransform();
                        }, { passive: false });

                        window.addEventListener('touchend', () => {
                            isDragging = false;
                        });

                        // Reset function
                        window.resetImageTransform = function () {
                            if (imagePreview.src) {
                                scale = 1;
                                pointX = 0;
                                pointY = 0;
                                imageSlider.value = 1;
                                updateTransform();
                            }
                        }

                        imageSlider.setAttribute('data-listener-attached', 'true');
                    }

                    // Reset if function exists
                    if (window.resetImageTransform) {
                        // window.resetImageTransform();
                    }
                }
            });
        }
    }
});

