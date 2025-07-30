class UserInterface {
    constructor() {
        this.init();
    }

    init() {
        this.createInputArea();
        this.createHistoryPanel();
    }

    createInputArea() {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Enter a natural language prompt...';
        inputField.className = 'prompt-input';

        const submitButton = document.createElement('button');
        submitButton.innerText = 'Generate';
        submitButton.className = 'generate-button';
        submitButton.onclick = () => this.handleSubmit(inputField.value);

        inputContainer.appendChild(inputField);
        inputContainer.appendChild(submitButton);
        document.body.appendChild(inputContainer);
    }

    createHistoryPanel() {
        const historyContainer = document.createElement('div');
        historyContainer.className = 'history-container';
        historyContainer.innerHTML = '<h2>History</h2>';
        this.historyList = document.createElement('ul');
        historyContainer.appendChild(this.historyList);
        document.body.appendChild(historyContainer);
    }

    handleSubmit(prompt) {
        // Logic to handle the prompt submission
        this.addToHistory(prompt);
        // Trigger geometry generation based on the prompt
    }

    addToHistory(prompt) {
        const listItem = document.createElement('li');
        listItem.innerText = prompt;
        this.historyList.appendChild(listItem);
    }
}

export default UserInterface;