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
    function createNotification(message) {
        const notification = document.createElement('div');
        notification.innerText = message;
        notification.classList.add('notification');
        const existingNotifications = document.querySelectorAll('.notification').length;
        const topPosition = 10 + (existingNotifications * 60); // Adjust the multiplier based on the height of your notifications
        notification.style.top = `${topPosition}px`;
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
            updateNotificationPositions();
        }, 3000); // Hide after 3 seconds
    }
    function updateNotificationPositions() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach((notification, index) => {
            const topPosition = 10 + (index * 60); // Adjust the multiplier based on the height of your notifications
            notification.style.top = `${topPosition}px`;
        });
    }
    document.getElementById('actionButton').addEventListener('click', function(event) {
        event.preventDefault();
        console.log('actionButton clicked');
        if (this.innerText.trim().toLowerCase() === 'convert') {
            const text = document.getElementById('inputData').value;
            if (text.trim() === '') {
                createNotification('No text to convert!');
            } else {
                const output = convertWavesToEpochs(text);
                if (output.trim() === '') {
                    createNotification('No waves found!');
                } else {
                    document.getElementById('outputData').innerText = output;
                    createNotification('Conversion completed!');                 
                    document.getElementById('inputData').style.display = 'none';
                    document.getElementById('inputData').value = '';
                    document.getElementById('outputData').style.display = 'block';
                    this.innerText = 'Copy';
                    this.title = 'Copy converted wave schedule to clipboard';
                    document.getElementById('label').innerText = 'Your converted wave schedule:';                       
                }
            }
        } else if (this.innerText.trim().toLowerCase() === 'copy') {
            const outputText = document.getElementById('outputData');
            if (outputText.innerText.trim() === '') {
                createNotification('No text to copy!');
            } else {
                navigator.clipboard.writeText(outputText.innerText).then(() => {
                    createNotification('Copied to clipboard!');
                    document.getElementById('outputData').style.display = 'none';
                    document.getElementById('outputData').innerText = '';
                    document.getElementById('inputData').style.display = 'block';
                    this.innerText = 'Convert';
                    this.title = 'Converted wave schedule to Discord Epochs';
                    document.getElementById('label').innerText = 'Paste your copied wave schedule here:';
                }).catch(error => {
                    // Handle the error here
                    console.error('Error writing to clipboard: ', error);
                    createNotification('Failed to copy to clipboard!');
                });
            }
        }
    });
    document.getElementById('aboutButton').addEventListener('click', function() {
        openModal();
    });
    function openModal() {
        console.log('openModal');
        var modal = document.getElementById("myModal");
        var span = document.getElementsByClassName("close")[0];
        modal.style.display = "block";
        span.addEventListener('click', function() {
            closeModal(modal);
        });
        window.addEventListener('click', function(event) {
            closeOnOutsideClick(event, modal);
        });
    }
    function closeModal(modal) {
        modal.style.display = "none";
    }
    function closeOnOutsideClick(event, modal) {
        if (event.target == modal) {
            event.stopPropagation();
            modal.style.display = "none";
        }
    }