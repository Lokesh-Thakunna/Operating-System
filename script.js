
        
        let activeWindows = [];
        let windowZIndex = 100;
        let calcDisplay = '0';
        let calcOperation = null;
        let calcPrevious = null;
        let calcWaitingForNew = false;

        
        function bootSystem() {
            const bootScreen = document.getElementById('bootScreen');
            const progressBar = document.getElementById('bootProgressBar');
            let progress = 0;

            const bootInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    progressBar.style.width = '100%';
                    setTimeout(() => {
                        bootScreen.style.opacity = '0';
                        setTimeout(() => {
                            bootScreen.style.display = 'none';
                            startSystem();
                        }, 500);
                    }, 500);
                    clearInterval(bootInterval);
                } else {
                    progressBar.style.width = progress + '%';
                }
            }, 200);
        }

        function startSystem() {
            updateSystemTime();
            setInterval(updateSystemTime, 1000);
            populateFileSystem();
            updateProcessList();
            setInterval(updateProcessList, 3000);
            showNotification('Welcome to QuantumOS!', 'success');
        }

        function updateSystemTime() {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById('systemTime').textContent = timeString;
        }

        function toggleStartMenu() {
            const startMenu = document.getElementById('startMenu');
            startMenu.classList.toggle('active');
        }

        function openWindow(windowId) {
            const window = document.getElementById(windowId);
            window.classList.add('active');
            window.style.zIndex = ++windowZIndex;

            if (!activeWindows.includes(windowId)) {
                activeWindows.push(windowId);
                addTaskbarApp(windowId);
            }

            document.getElementById('startMenu').classList.remove('active');
        }

        function closeWindow(windowId) {
            const window = document.getElementById(windowId);
            window.classList.remove('active');

            activeWindows = activeWindows.filter(id => id !== windowId);
            removeTaskbarApp(windowId);
        }

        function minimizeWindow(windowId) {
            const window = document.getElementById(windowId);
            window.classList.remove('active');
        }

        function maximizeWindow(windowId) {
            const window = document.getElementById(windowId);
            if (window.style.width === '100vw') {
                window.style.width = '700px';
                window.style.height = '500px';
                window.style.top = '100px';
                window.style.left = '100px';
            } else {
                window.style.width = '100vw';
                window.style.height = 'calc(100vh - 50px)';
                window.style.top = '0';
                window.style.left = '0';
            }
        }

        function addTaskbarApp(windowId) {
            const taskbarApps = document.getElementById('taskbarApps');
            const appButton = document.createElement('div');
            appButton.className = 'taskbar-app active';
            appButton.id = 'taskbar-' + windowId;
            appButton.textContent = getWindowTitle(windowId);
            appButton.onclick = () => {
                const window = document.getElementById(windowId);
                if (window.classList.contains('active')) {
                    window.classList.remove('active');
                    appButton.classList.remove('active');
                } else {
                    window.classList.add('active');
                    window.style.zIndex = ++windowZIndex;
                    appButton.classList.add('active');
                }
            };
            taskbarApps.appendChild(appButton);
        }

        function removeTaskbarApp(windowId) {
            const appButton = document.getElementById('taskbar-' + windowId);
            if (appButton) {
                appButton.remove();
            }
        }

        function getWindowTitle(windowId) {
            const titles = {
                'fileExplorer': 'File Explorer',
                'terminal': 'Terminal',
                'calculator': 'Calculator',
                'taskManager': 'Task Manager',
                'settings': 'Settings'
            };
            return titles[windowId] || windowId;
        }

        
        function populateFileSystem() {
            const fileGrid = document.getElementById('fileGrid');
            const files = [
                { name: 'Documents', type: 'folder', icon: '📁' },
                { name: 'Pictures', type: 'folder', icon: '📁' },
                { name: 'Music', type: 'folder', icon: '📁' },
                { name: 'Videos', type: 'folder', icon: '📁' },
                { name: 'readme.txt', type: 'file', icon: '📄' },
                { name: 'photo.jpg', type: 'file', icon: '🖼️' },
                { name: 'song.mp3', type: 'file', icon: '🎵' },
            ]
            
            fileGrid.innerHTML = '';
            files.forEach(file => {
                const fileElement = document.createElement('div');
                fileElement.className = 'file-item';
                fileElement.textContent = `${file.icon} ${file.name}`;
                fileElement.onclick = () => showNotification(`${file.name} opened`, 'info');
                fileGrid.appendChild(fileElement);
            });
        }

     
        function navigateToFolder(folderName) {
            showNotification(`Navigated to ${folderName}`, 'info');
        }

        
        function showNotification(message, type) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = 'notification ' + type;
            notification.style.opacity = 1;
            setTimeout(() => {
                notification.style.opacity = 0;
            }, 3000);
        }

       
        function handleTerminalInput(event) {
            if (event.key === 'Enter') {
                const input = event.target.value.trim();
                const terminalContent = document.getElementById('terminalContent');
                const newLine = document.createElement('div');
                newLine.className = 'terminal-line';
                newLine.textContent = `user@quantumos:~$ ${input}`;
                terminalContent.appendChild(newLine);

                const outputLine = document.createElement('div');
                outputLine.className = 'terminal-line';

                switch (input.toLowerCase()) {
                    case 'help':
                        outputLine.textContent = 'Available commands: help, clear, echo [text]';
                        break;
                    case 'clear':
                        terminalContent.innerHTML = '';
                        return;
                    default:
                        if (input.startsWith('echo ')) {
                            outputLine.textContent = input.slice(5);
                        } else {
                            outputLine.textContent = `'${input}' is not recognized as a command`;
                        }
                }

                terminalContent.appendChild(outputLine);
                event.target.value = '';
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
        }

        
        function calcInput(value) {
            const display = document.getElementById('calcDisplay');
            if (calcWaitingForNew) {
                display.textContent = value;
                calcWaitingForNew = false;
            } else {
                if (display.textContent === '0' && value !== '.') {
                    display.textContent = value;
                } else {
                    display.textContent += value;
                }
            }
        }

        function calcClear() {
            document.getElementById('calcDisplay').textContent = '0';
            calcOperation = null;
            calcPrevious = null;
            calcWaitingForNew = false;
        }

        function calcBackspace() {
            const display = document.getElementById('calcDisplay');
            display.textContent = display.textContent.slice(0, -1) || '0';
        }

        function calcEquals() {
            const display = document.getElementById('calcDisplay');
            try {
                display.textContent = eval(display.textContent.replace(/×/g, '*').replace(/÷/g, '/'));
            } catch {
                display.textContent = 'Error';
            }
            calcWaitingForNew = true;
        }

        
        function updateProcessList() {
            const processList = document.getElementById('processList');
            processList.innerHTML = '';
            activeWindows.forEach(id => {
                const proc = document.createElement('div');
                proc.textContent = `🔹 ${getWindowTitle(id)} (PID: ${Math.floor(Math.random() * 1000)})`;
                processList.appendChild(proc);
            });
        }

        
        function changeWallpaper(theme) {
            const desktop = document.getElementById('desktop');
            switch (theme) {
                case 'blue':
                    desktop.style.background = 'linear-gradient(135deg, #2193b0, #6dd5ed)';
                    break;
                case 'green':
                    desktop.style.background = 'linear-gradient(135deg, #56ab2f, #a8e063)';
                    break;
                case 'purple':
                    desktop.style.background = 'linear-gradient(135deg, #654ea3, #eaafc8)';
                    break;
                default:
                    desktop.style.background = 'linear-gradient(135deg, #2c3e50, #3498db)';
            }
        }

        
        window.onload = bootSystem;

        