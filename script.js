class RecipeController {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 8;
        this.isTimerRunning = false;
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.cookingStarted = false;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeUI();
    }
    
    initializeElements() {
        // HUD Elements
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.startCookingBtn = document.getElementById('start-cooking-btn');
        this.nextStepBtn = document.getElementById('next-step-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.timerValue = document.getElementById('timer-value');
        this.timerToggle = document.getElementById('timer-toggle');
        this.printBtn = document.getElementById('print-btn');
        
        // Content Elements
        this.ingredientsToggle = document.getElementById('ingredients-toggle');
        this.ingredientsContent = document.getElementById('ingredients-content');
        this.instructionsContent = document.getElementById('instructions-content');
        this.currentStepDisplay = document.getElementById('current-step-display');
        
        // Steps and Ingredients
        this.instructionSteps = document.querySelectorAll('.instruction-step');
        this.ingredientItems = document.querySelectorAll('.ingredient-item');
    }
    
    bindEvents() {
        // HUD Controls
        this.startCookingBtn.addEventListener('click', () => this.startCooking());
        this.nextStepBtn.addEventListener('click', () => this.nextStep());
        this.resetBtn.addEventListener('click', () => this.resetCooking());
        this.timerToggle.addEventListener('click', () => this.toggleTimer());
        this.printBtn.addEventListener('click', () => this.printRecipe());
        
        // Section Toggle
        this.ingredientsToggle.addEventListener('click', () => this.toggleIngredients());
        
        // Ingredient Interactions
        this.ingredientItems.forEach(item => {
            item.addEventListener('click', () => this.toggleIngredient(item));
        });
        
        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Step hover effects
        this.instructionSteps.forEach(step => {
            step.addEventListener('mouseenter', () => this.previewStep(step));
            step.addEventListener('mouseleave', () => this.clearPreview(step));
        });
    }
    
    initializeUI() {
        // Show ingredients by default
        this.ingredientsContent.classList.remove('collapsed');
        
        this.updateStepCounter();
        
        this.updateProgress();
    }
    
    startCooking() {
        this.cookingStarted = true;
        this.currentStep = 1;
        
        // Update UI
        this.startCookingBtn.style.display = 'none';
        this.nextStepBtn.style.display = 'flex';
        this.resetBtn.style.display = 'flex';
        
        // Highlight first step
        this.highlightCurrentStep();
        
        // Update progress
        this.updateProgress();
        
        // Auto-start timer
        if (!this.isTimerRunning) {
            this.toggleTimer();
        }
        
        // Show notification
        this.showNotification('Cooking started! Follow the highlighted steps.');
    }
    
    nextStep() {
        if (this.currentStep <= this.totalSteps) {
            // Mark current step as completed
            const currentStepElement = this.instructionSteps[this.currentStep - 1];
            currentStepElement.classList.remove('active');
            currentStepElement.classList.add('completed');
            
            this.currentStep++;
            
            if (this.currentStep <= this.totalSteps) {
                this.highlightCurrentStep();
            } else {
                this.completeCooking();
            }
            
            this.updateProgress();
            this.updateStepCounter();
        }
    }
    
    highlightCurrentStep() {
        // Clear all active states
        this.instructionSteps.forEach(step => step.classList.remove('active'));
        
        // Highlight current step
        if (this.currentStep <= this.totalSteps) {
            const activeStep = this.instructionSteps[this.currentStep - 1];
            activeStep.classList.add('active');
            
            // Smooth scroll to active step
            activeStep.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    completeCooking() {
        this.nextStepBtn.style.display = 'none';
        this.progressText.textContent = 'Recipe completed! 🎉';
        this.progressFill.style.background = '#28a745';
        
        // Stop timer
        if (this.isTimerRunning) {
            this.toggleTimer();
        }
        
        // Show completion notification
        this.showNotification('Congratulations! Your chocolate cake is ready! 🍰');
    }
    
    resetCooking() {
        this.cookingStarted = false;
        this.currentStep = 0;
        
        // Reset UI
        this.startCookingBtn.style.display = 'flex';
        this.nextStepBtn.style.display = 'none';
        this.resetBtn.style.display = 'none';
        
        // Reset steps
        this.instructionSteps.forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        // Reset progress
        this.progressFill.style.width = '0%';
        this.progressFill.style.background = '#ff0000';
        this.updateProgress();
        this.updateStepCounter();
        
        // Reset timer
        if (this.isTimerRunning) {
            this.toggleTimer();
        }
        this.timerSeconds = 0;
        this.updateTimerDisplay();
        
        // Reset ingredients
        this.ingredientItems.forEach(item => {
            item.classList.remove('checked');
        });
    }
    
    updateProgress() {
        const progressPercent = (this.currentStep / this.totalSteps) * 100;
        this.progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
        
        if (this.currentStep === 0) {
            this.progressText.textContent = 'Ready to cook';
        } else if (this.currentStep <= this.totalSteps) {
            this.progressText.textContent = `Step ${this.currentStep} in progress`;
        } else {
            this.progressText.textContent = 'Recipe completed! 🎉';
        }
    }
    
    updateStepCounter() {
        this.currentStepDisplay.textContent = `Step ${this.currentStep}`;
    }
    
    toggleTimer() {
        if (!this.isTimerRunning) {
            this.startTimer();
        } else {
            this.stopTimer();
        }
    }
    
    startTimer() {
        this.isTimerRunning = true;
        this.timerToggle.textContent = 'Stop';
        
        this.timerInterval = setInterval(() => {
            this.timerSeconds++;
            this.updateTimerDisplay();
        }, 1000);
    }
    
    stopTimer() {
        this.isTimerRunning = false;
        this.timerToggle.textContent = 'Start';
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timerSeconds / 60);
        const seconds = this.timerSeconds % 60;
        this.timerValue.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    toggleIngredients() {
        const isCollapsed = this.ingredientsContent.classList.contains('collapsed');
        
        if (isCollapsed) {
            this.ingredientsContent.classList.remove('collapsed');
            this.ingredientsToggle.classList.remove('collapsed');
            this.ingredientsToggle.querySelector('.toggle-icon').textContent = '−';
        } else {
            this.ingredientsContent.classList.add('collapsed');
            this.ingredientsToggle.classList.add('collapsed');
            this.ingredientsToggle.querySelector('.toggle-icon').textContent = '+';
        }
    }
    
    toggleIngredient(item) {
        item.classList.toggle('checked');
        
        if (item.classList.contains('checked')) {
            item.style.transform = 'scale(0.98)';
            setTimeout(() => {
                item.style.transform = '';
            }, 200);
        }
    }
    
    previewStep(step) {
        if (!this.cookingStarted || step.classList.contains('active')) return;
        
        step.style.transform = 'translateX(5px)';
        step.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.15)';
    }
    
    clearPreview(step) {
        if (step.classList.contains('active')) return;
        
        step.style.transform = '';
        step.style.boxShadow = '';
    }
    
    handleKeyboard(e) {
        // Prevent default only for our shortcuts
        switch(e.code) {
            case 'Space':
                if (this.cookingStarted && this.nextStepBtn.style.display !== 'none') {
                    e.preventDefault();
                    this.nextStep();
                } else if (!this.cookingStarted) {
                    e.preventDefault();
                    this.startCooking();
                }
                break;
            case 'KeyR':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.resetCooking();
                }
                break;
            case 'KeyT':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleTimer();
                }
                break;
            case 'KeyP':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.printRecipe();
                }
                break;
        }
    }
    
    printRecipe() {
        // Expand ingredients if collapsed
        if (this.ingredientsContent.classList.contains('collapsed')) {
            this.toggleIngredients();
        }
        
        setTimeout(() => {
            window.print();
        }, 300);
    }
    
    showNotification(message) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #000;
            color: #fff;
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 4px solid #ff0000;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Add slide animation
        const slideCSS = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = slideCSS;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RecipeController();
});

if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScrollPolyfill = document.createElement('script');
    smoothScrollPolyfill.src = 'https://cdn.jsdelivr.net/gh/iamdustan/smoothscroll@master/src/smoothscroll.js';
    document.head.appendChild(smoothScrollPolyfill);
}
