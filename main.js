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
                        fileInput.accept = '.pdf, .doc, .docx';
                    }

                    // Reset value if switching types? Optional, but safer to avoid wrong file type submission
                    // fileInput.value = ''; 
                    // Update: Actually we shouldn't clear it immediately if user just misclicked, 
                    // but since we reuse the input, maybe safer to keep unless type mismatch.

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

                    // VALIDATION FOR DOCUMENT
                    if (category === 'Dokumen') {
                        // Check Type (PDF only)
                        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                            alert('Harap maaf. Sila muat naik fail dalam format PDF sahaja.');
                            hiddenFileInput.value = ''; // Clear input
                            fileNameDisplay.innerText = 'Tiada file dipilih';
                            changeFileBtn.style.display = 'none';
                            return; // Stop processing
                        }

                        // Check Size (Max 2MB)
                        const maxSize = 2 * 1024 * 1024; // 2MB
                        if (file.size > maxSize) {
                            alert('Saiz fail terlalu besar. Sila pastikan fail anda bawah 2MB.');
                            hiddenFileInput.value = ''; // Clear input
                            fileNameDisplay.innerText = 'Tiada file dipilih';
                            changeFileBtn.style.display = 'none';
                            return; // Stop processing
                        }
                    }

                    // VALIDATION FOR IMAGE
                    if (category === 'Imej') {
                        // Check Size (Max 2MB)
                        if (fileSize > 2 * 1024 * 1024) {
                            alert('Maaf, saiz file gambar mestilah kurang daripada 2MB.');
                            hiddenFileInput.value = ''; // Clear input
                            return;
                        }

                        // Check Type
                        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                        if (!validTypes.includes(file.type)) {
                            alert('Hanya format JPG dan PNG dibenarkan untuk Gambar.');
                            hiddenFileInput.value = ''; // Clear input
                            return;
                        }

                        // Show Image Fields
                        if (imageSpecificFields) imageSpecificFields.style.display = 'block';
                    } else if (category === 'Dokumen') {
                        // VALIDATION FOR DOCUMENT
                        // Check Size (Max 2MB)
                        if (fileSize > 2 * 1024 * 1024) {
                            alert('Maaf, saiz dokumen mestilah kurang daripada 2MB.');
                            hiddenFileInput.value = ''; // Clear input
                            return;
                        }

                        // Check Type
                        // Note: file.type might vary, better to check extension or broad types
                        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                        // Or check extension manually if mime types are unreliable ? 
                        // Let's rely on basic check first, if it fails user gets alert.
                        // Actually extension check is safer for basic UI

                        if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
                            alert('Hanya format PDF, DOC dan DOCX dibenarkan.');
                            hiddenFileInput.value = '';
                            return;
                        }

                        if (documentSpecificFields) documentSpecificFields.style.display = 'block';

                    } else {
                        // Hide Image Fields for others
                        if (imageSpecificFields) imageSpecificFields.style.display = 'none';
                    }

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

                        if (category === 'Imej' && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                imagePreview.src = e.target.result;
                                if (imageUploadFrame) imageUploadFrame.style.display = 'flex';

                                // Reset Slider
                                if (imageSlider) {
                                    imageSlider.value = 50;
                                    imagePreview.style.objectPosition = '50% 50%';
                                }
                                if (imageSliderContainer) imageSliderContainer.style.display = 'block';
                            }
                            reader.readAsDataURL(file);
                        }
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
                            const imgRatio = imagePreview.naturalWidth / imagePreview.naturalHeight;
                            const frameRatio = FRAME_WIDTH / FRAME_HEIGHT;

                            // Reset transform
                            scale = 1;
                            pointX = 0;
                            pointY = 0;
                            imageSlider.value = 1;

                            if (imgRatio > frameRatio) {
                                // Image is wider than frame -> Height = frame height + buffer
                                baseHeight = FRAME_HEIGHT + BUFFER;
                                baseWidth = baseHeight * imgRatio;
                                imagePreview.style.width = `${baseWidth}px`;
                                imagePreview.style.height = `${baseHeight}px`;
                            } else {
                                // Image is taller than frame -> Width = frame width + buffer
                                baseWidth = FRAME_WIDTH + BUFFER;
                                baseHeight = baseWidth / imgRatio;
                                imagePreview.style.width = `${baseWidth}px`;
                                imagePreview.style.height = `${baseHeight}px`;
                            }
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
                            const excessX = Math.max(0, currentWidth - FRAME_WIDTH);
                            const excessY = Math.max(0, currentHeight - FRAME_HEIGHT);

                            // You can pan half the excess in each direction
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
                            isDragging = true;
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
                        });

                        // Drag Events (Touch)
                        imageUploadFrame.addEventListener('touchstart', (e) => {
                            if (e.touches.length === 1) {
                                e.preventDefault();
                                startX = e.touches[0].clientX - pointX;
                                startY = e.touches[0].clientY - pointY;
                                isDragging = true;
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

