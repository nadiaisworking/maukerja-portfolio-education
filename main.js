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
        alert('Terima kasih! Perkongsian anda telah direkodkan.');
    });
});
