document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const greetBtn = document.getElementById('greetBtn');
    const greetingOutput = document.getElementById('greetingOutput');
    const container = document.getElementById('particles-container');

    greetBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name === "") {
            greetingOutput.innerText = "Please enter your name!";
            greetingOutput.style.color = "#fb7185";
        } else {
            greetingOutput.innerText = `Hello ${name}! ✨`;
            greetingOutput.style.color = "#f8fafc";
            triggerRandomAnimation();
        }
        
        greetingOutput.classList.remove('show');
        void greetingOutput.offsetWidth; // Trigger reflow
        greetingOutput.classList.add('show');
    });

    function triggerRandomAnimation() {
        // Clear previous animations
        container.innerHTML = '';

        const animations = ['confetti', 'popper', 'burst'];
        const randomChoice = animations[Math.floor(Math.random() * animations.length)];

        switch (randomChoice) {
            case 'confetti':
                createConfetti();
                break;
            case 'popper':
                createPopper();
                break;
            case 'burst':
                createBurst();
                break;
        }
    }

    function createConfetti() {
        const colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
        for (let i = 0; i < 100; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 10 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `-20px`;
            particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            
            particle.style.animation = `confetti-fall ${duration}s linear ${delay}s forwards`;
            container.appendChild(particle);
        }
    }

    function createPopper() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < 80; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 8 + 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 300 + 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            const duration = Math.random() * 1 + 0.5;
            particle.style.animation = `popper-burst ${duration}s ease-out forwards`;
            container.appendChild(particle);
        }
    }

    function createBurst() {
        const burst = document.createElement('div');
        burst.style.position = 'absolute';
        burst.style.top = '50%';
        burst.style.left = '50%';
        burst.style.transform = 'translate(-50%, -50%)';
        burst.style.width = '300px';
        burst.style.height = '300px';
        burst.style.borderRadius = '50%';
        burst.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(99,102,241,0.4) 50%, transparent 70%)';
        burst.style.animation = 'glowing-burst 1s ease-out forwards';
        container.appendChild(burst);

        // Add some small glowing sparks around
        for (let i = 0; i < 40; i++) {
            const spark = document.createElement('div');
            spark.className = 'particle';
            spark.style.width = '4px';
            spark.style.height = '4px';
            spark.style.backgroundColor = '#fff';
            spark.style.left = '50%';
            spark.style.top = '50%';
            
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 200 + 50;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            
            spark.style.setProperty('--tx', `${tx}px`);
            spark.style.setProperty('--ty', `${ty}px`);
            spark.style.animation = `popper-burst 0.8s ease-out forwards`;
            container.appendChild(spark);
        }
    }
});
