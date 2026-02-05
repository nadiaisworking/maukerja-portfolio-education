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

        el.addEventListener('mousedown', start);
        el.addEventListener('touchstart', start, { passive: false });

        function start(e) {
            isDragging = true;
            const pos = e.type === 'touchstart' ? e.touches[0] : e;

            // Get initial offset before changing position to fixed
            const rect = el.getBoundingClientRect();
            startX = pos.clientX - rect.left;
            startY = pos.clientY - rect.top;

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

    document.getElementById('portfolio-form')?.addEventListener('submit', (e) => {
        e.preventDefault();

        // Show WhatsApp Modal
        const modal = document.getElementById('whatsapp-modal');
        if (modal) modal.classList.add('active');
    });

    // Close Modal Logic
    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
        document.getElementById('whatsapp-modal')?.classList.remove('active');
    });

    // Optional: Close on outside click
    document.getElementById('whatsapp-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'whatsapp-modal') {
            e.target.classList.remove('active');
        }
    });

    // NEW: Handle Folder Click & File Upload
    // NEW: Handle Folder Click & File Upload
    window.triggerUpload = function (category) {
        const categoryInput = document.getElementById('selected-category');
        const fileInput = document.getElementById('hidden-file-input');
        const submissionArea = document.getElementById('submission-area');
        const videoSpecificFields = document.getElementById('video-specific-fields');
        const imageSpecificFields = document.getElementById('image-specific-fields');
        const fileUploadSection = document.getElementById('file-name-display')?.parentElement; // The div with "Fail Dipilih"

        if (categoryInput) {
            categoryInput.value = category;

            // Reset UI & Validation
            if (submissionArea) submissionArea.style.display = 'none';
            if (videoSpecificFields) videoSpecificFields.style.display = 'none';
            if (imageSpecificFields) imageSpecificFields.style.display = 'none';
            if (fileUploadSection) fileUploadSection.style.display = 'flex'; // Reset to show file picker by default

            // Default: File is required
            if (fileInput) fileInput.required = true;

            // VIDEO FLOW (No File Upload)
            if (category === 'Video') {
                if (fileUploadSection) fileUploadSection.style.display = 'none'; // Hide file picker
                if (videoSpecificFields) videoSpecificFields.style.display = 'block';

                // Video: File NOT required, Link REQUIRED
                if (fileInput) fileInput.required = false;

                if (submissionArea) {
                    submissionArea.style.display = 'block';
                    setTimeout(() => {
                        submissionArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
                return; // Stop here, don't open file picker
            }

            // FILE UPLOAD FLOWS
            if (fileInput) {
                // Set specific accept types for Image
                if (category === 'Imej') {
                    fileInput.accept = '.jpg, .jpeg, .png';
                } else {
                    fileInput.removeAttribute('accept'); // Reset for other types
                }
                fileInput.click();
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
                    } else {
                        // Hide Image Fields for others
                        if (imageSpecificFields) imageSpecificFields.style.display = 'none';
                    }

                    // Display Preview
                    const imagePreview = document.getElementById('image-preview');
                    if (imagePreview) {
                        imagePreview.style.display = 'none';
                        imagePreview.src = '';

                        if (category === 'Imej' && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                imagePreview.src = e.target.result;
                                imagePreview.style.display = 'block';
                            }
                            reader.readAsDataURL(file);
                        }
                    }

                    if (fileNameDisplay) {
                        fileNameDisplay.innerText = fileName;
                        fileNameDisplay.style.color = '#333';
                    }

                    if (changeFileBtn) changeFileBtn.style.display = 'block';

                    if (submissionArea) {
                        submissionArea.style.display = 'block';
                        // Small delay to ensure display is rendered before scrolling
                        setTimeout(() => {
                            submissionArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                    }
                }
            });
        }
    }
});
