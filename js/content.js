function convertWavesToEpochs(text) {
    const waveDateTimeRegex = /(wave \d+).*\b(\d{4})\b.*UTC.*\b(\w+)\b (\d{2})/gi;
    let match;
    const epochs = [];
    while ((match = waveDateTimeRegex.exec(text)) !== null) {
        const waveInfo = match[1];
        const militaryTime = match[2];
        const month = match[3];
        const day = match[4];
        const hours = parseInt(militaryTime.slice(0, 2), 10);
        const minutes = parseInt(militaryTime.slice(2, 4), 10);
        const monthIndex = new Date(Date.parse(month +" 1, 2012")).getMonth();
        const currentYear = new Date().getFullYear();
        const timestamp = Date.UTC(currentYear, monthIndex, day, hours, minutes) / 1000;
        epochs.push([waveInfo, timestamp]);
    }
    const formattedEpochs = epochs.map(([waveInfo, epoch]) => {
        const date = new Date(epoch * 1000);
        const formattedDate = `<t:${Math.floor(epoch)}:f>`;
        return waveInfo + ': ' + formattedDate;
    });
    return formattedEpochs.join('\n');
}
// Notification functions
function createNotification(message) {
    const notification = document.createElement('div');
    notification.innerText = message;
    notification.classList.add('w3-panel', 'w3-grey', 'w3-animate-top', 'app-notification');
    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000); // Hide after 3 seconds
}
// Action button event listener for conversion and copying
let actionButtonState = 'convert'; // Initialize the state

document.getElementById('actionButton').addEventListener('click', function(event) {
    event.preventDefault();

    if (actionButtonState === 'convert') {
        const text = document.getElementById('inputData').value;
        if (text.trim() === '') {
            createNotification('Warning!\nNo text to convert!');
        } else {
            const output = convertWavesToEpochs(text);
            if (output.trim() === '') {
                createNotification('Warning!\nNo waves found!');
            } else {
                document.getElementById('outputData').innerText = output;
                createNotification('Success!\nConversion completed!');
                document.getElementById('inputArea').style.display = 'none';
                document.getElementById('inputData').value = '';
                document.getElementById('outputArea').style.display = 'block';
                this.innerText = 'Copy';
                this.title = 'Copy converted wave schedule to clipboard';
                document.getElementById('label').innerText = 'Your converted wave schedule:';                       
                actionButtonState = 'copy'; // Update the state
            }
        }
    } else if (actionButtonState === 'copy') {
        const outputText = document.getElementById('outputData');
        if (outputText.innerText.trim() === '') {
            createNotification('Warning!\nNo text to copy!');
        } else {
            navigator.permissions.query({name: "clipboard-write"}).then(result => {
                if (result.state === 'granted' || result.state === 'prompt') {
                    navigator.clipboard.writeText(outputText.innerText).then(() => {
                        createNotification('Success!\nCopied to clipboard!');
                        this.innerText = 'Reset';
                        this.title = 'Reset the form to convert another wave schedule';
                        actionButtonState = 'reset'; // Update the state
                    }).catch(error => {
                        console.error('Error writing to clipboard: ', error);
                        createNotification('Warning!\nFailed to copy to clipboard!');
                    });
                } else {
                    console.error('Clipboard access denied!');
                    createNotification('Warning!\nNo permission to write to clipboard!');
                }
            });
        }
    } else if (actionButtonState === 'reset') {
        document.getElementById('outputArea').style.display = 'none';
        document.getElementById('outputData').innerText = '';
        document.getElementById('inputArea').style.display = 'block';
        this.innerText = 'Convert';
        this.title = 'Convert wave schedule to Discord Epochs';
        document.getElementById('label').innerText = 'Paste your copied wave schedule here:';
        actionButtonState = 'convert'; // Update the state
    }
});
// About button event listener for modal
document.getElementById('aboutButton').addEventListener('click', function() {
    modal(openModal = true, closeModal = false);
});

// Modal functions
function modal(openModal, closeModal) {
    var modal = document.getElementById("myModal");
    var span = document.getElementById("closeModal");

    // Close button event handler
    span.onclick = function() {
        modal.style.display = 'none';
    };

    // Click outside modal event handler
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    if (openModal) {
        modal.style.display = 'block';
    } else if (closeModal) {
        modal.style.display = 'none';
    }
}