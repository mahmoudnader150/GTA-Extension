class GTALeetCodeDetector {
    constructor() {
        this.config = {
            volume: 0.75,
            cooldownTime: 4000,
            maxRetries: 3
        };
        
        this.state = {
            lastResultHash: '',
            isOnCooldown: false,
            processedResults: new Set()
        };
        
        this.selectors = {
            primary: '[data-e2e-locator="submission-result"]',
            secondary: '.submission-result, [class*="result"], [class*="status"]',
            modal: '[role="dialog"], .modal, [class*="modal"]',
            notification: '[class*="notification"], [class*="alert"], [class*="message"]'
        };
        
        this.patterns = {
            success: /accepted|correct|passed|success/i,
            failure: /wrong\s+answer|time\s+limit|memory\s+limit|runtime\s+error|compilation\s+error|presentation\s+error|segmentation\s+fault/i
        };
        
        this.initialize();
    }

    initialize() {
        this.setupMultipleObservers();
        this.setupKeyboardShortcuts();
        this.logStatus('🎮 GTA LeetCode Extension - Fixed Version Active');
    }

    logStatus(message) {
        console.log(`%c${message}`, 'color: #ff6b35; font-weight: bold;');
    }

    createHash(text) {
        // Removed Date.now() for consistent hash
        const cleanText = text.replace(/\s+/g, ' ').trim().toLowerCase();
        return btoa(cleanText).slice(0, 12);
    }

    async playSound(type, retryCount = 0) {
        if (this.state.isOnCooldown || retryCount >= this.config.maxRetries) return;

        try {
            const audio = new Audio(chrome.runtime.getURL(`assets/${type}.mp3`));
            audio.volume = this.config.volume;

            await new Promise((resolve, reject) => {
                audio.oncanplaythrough = resolve;
                audio.onerror = reject;
                audio.load();
            });

            await audio.play();
            this.setCooldown();
            this.logStatus(`🔊 Playing ${type} sound`);

        } catch (error) {
            this.logStatus(`❌ Audio error (attempt ${retryCount + 1}): ${error.message}`);
            if (retryCount < this.config.maxRetries - 1) {
                setTimeout(() => this.playSound(type, retryCount + 1), 500);
            }
        }
    }

    setCooldown() {
        this.state.isOnCooldown = true;
        setTimeout(() => {
            this.state.isOnCooldown = false;
        }, this.config.cooldownTime);
    }

    extractResultText() {
        const sources = [
            () => document.querySelector(this.selectors.primary)?.textContent,
            () => {
                const elements = document.querySelectorAll(this.selectors.secondary);
                for (const el of elements) {
                    const text = el.textContent.trim();
                    if (text && (this.patterns.success.test(text) || this.patterns.failure.test(text))) {
                        return text;
                    }
                }
                return null;
            }
        ];

        for (const source of sources) {
            try {
                const text = source();
                if (text && text.trim()) return text.trim();
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    processResult() {
        const resultText = this.extractResultText();
        if (!resultText) return;

        const resultHash = this.createHash(resultText);

        if (this.state.processedResults.has(resultHash)) {
            this.logStatus('⏭ Skipping duplicate result: ' + resultText.slice(0, 30));
            return;
        }

        this.state.processedResults.add(resultHash);
        this.state.lastResultHash = resultHash;

        if (this.state.processedResults.size > 10) {
            const resultsArray = Array.from(this.state.processedResults);
            this.state.processedResults = new Set(resultsArray.slice(-10));
        }

        if (this.patterns.success.test(resultText)) {
            this.playSound('passed');
            this.logStatus('✅ SUCCESS DETECTED: ' + resultText.slice(0, 50));
        } else if (this.patterns.failure.test(resultText)) {
            this.playSound('wasted');
            this.logStatus('❌ FAILURE DETECTED: ' + resultText.slice(0, 50));
        }
    }

    setupMultipleObservers() {
        let observerTimeout;

        const mainObserver = new MutationObserver(() => {
            clearTimeout(observerTimeout);
            observerTimeout = setTimeout(() => this.processResult(), 200);
        });

        mainObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-e2e-locator']
        });

        setInterval(() => this.processResult(), 5000);

        window.addEventListener('focus', () => {
            setTimeout(() => this.processResult(), 1000);
        });

        setTimeout(() => this.processResult(), 2000);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'G') {
                e.preventDefault();
                this.state.processedResults.clear();
                this.state.lastResultHash = '';
                this.processResult();
                this.logStatus('🔄 Manual trigger activated');
            }
        });
    }
}

// Initialize the detector
new GTALeetCodeDetector();
