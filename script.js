/**
 * PROJECT: FOCUS TAB EXTENSION
 * Dev: DUTVcore
 * Updated: Future Tasks & Pomodoro Timer
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. KHỞI TẠO BIẾN (DOM ELEMENTS)
    // ==========================================
    const mainContainer = document.getElementById('main-container');
    const dragHandle = document.getElementById('drag-handle');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const recheckBtn = document.getElementById('recheck-btn');
    const listTitle = document.getElementById('list-title');
    const focusInput = document.getElementById('focus-input');
    const toggleFocusBtn = document.getElementById('toggle-focus-btn');
    
    // Settings Elements
    const settingIcon = document.getElementById('setting-icon');
    const modal = document.getElementById('settings-modal');
    const closeModal = document.getElementById('close-modal');
    const resetHourInput = document.getElementById('reset-hour-input');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const zoomRange = document.getElementById('zoom-range');
    const fontSelect = document.getElementById('font-select');
    const bgContainer = document.getElementById('bg-container');
    const bgUrlInput = document.getElementById('bg-url-input');
    const saveBgBtn = document.getElementById('save-bg-btn');
    const resetBgBtn = document.getElementById('reset-bg-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Calendar Elements
    const calendarPopup = document.getElementById('calendar-popup');
    const calendarBtn = document.getElementById('calendar-btn'); 
    const closeCalendarBtn = document.getElementById('close-calendar');
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearText = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // ==========================================
    // 2. XỬ LÝ MODAL & CÀI ĐẶT
    // ==========================================
    function toggleModal(show) { 
        if (!modal) return;
        show ? modal.classList.remove('hidden') : modal.classList.add('hidden'); 
    }

    if (settingIcon) settingIcon.addEventListener('click', () => toggleModal(true));
    if (closeModal) closeModal.addEventListener('click', () => toggleModal(false));

    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.add('hidden'));
                btn.classList.add('active');
                const target = document.getElementById(btn.getAttribute('data-target'));
                if (target) target.classList.remove('hidden');
            });
        });
    }

    // ==========================================
    // 3. ĐỒNG HỒ SỐ & NGÀY THÁNG
    // ==========================================
    function updateClock() {
        const now = new Date();
        const clockEl = document.getElementById('clock');
        const dateEl = document.getElementById('date-display');
        
        if (clockEl) clockEl.innerText = now.toLocaleTimeString('vi-VN', { hour12: false });
        
        if (dateEl) {
            const dateOption = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
            dateEl.innerText = new Intl.DateTimeFormat('vi-VN', dateOption).format(now);
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ==========================================
    // 4. CÀI ĐẶT GIAO DIỆN (ZOOM & FONT)
    // ==========================================
    const savedZoom = localStorage.getItem('appZoom') || '1';
    const savedFont = localStorage.getItem('appFont') || "'Segoe UI', sans-serif";

    if(mainContainer) mainContainer.style.zoom = savedZoom;
    document.body.style.fontFamily = savedFont;

    if (zoomRange) {
        zoomRange.value = savedZoom;
        const zoomValDisplay = document.getElementById('zoom-val'); 
        if(zoomValDisplay) zoomValDisplay.innerText = savedZoom;
    
        zoomRange.addEventListener('input', (e) => {
            if(mainContainer) mainContainer.style.zoom = e.target.value;
            localStorage.setItem('appZoom', e.target.value);
            if(zoomValDisplay) zoomValDisplay.innerText = e.target.value;
        });
    }

    if (fontSelect) {
        fontSelect.value = savedFont;
        fontSelect.addEventListener('change', (e) => {
            document.body.style.fontFamily = e.target.value;
            localStorage.setItem('appFont', e.target.value);
        });
    }

    // ==========================================
    // 5. CÀI ĐẶT GIỜ "CÚ ĐÊM"
    // ==========================================
    if (resetHourInput && saveSettingsBtn) {
        resetHourInput.value = localStorage.getItem('userResetHour') || 0;
        saveSettingsBtn.addEventListener('click', () => {
            const val = parseInt(resetHourInput.value);
            if (val >= 0 && val <= 23) {
                localStorage.setItem('userResetHour', val);
                alert(`Đã lưu! Reset task lúc ${val}h sáng.`);
                location.reload(); 
            } else {
                alert("Giờ không hợp lệ (0-23)");
            }
        });
    }

    // ==========================================
    // 6. QUẢN LÝ HÌNH NỀN
    // ==========================================
    const savedBgUrl = localStorage.getItem('myBackgroundUrl');
    if (savedBgUrl) { applyBackground(savedBgUrl); if(bgUrlInput) bgUrlInput.value = savedBgUrl; }

    function applyBackground(url) {
        if (!bgContainer) return;
        bgContainer.innerHTML = '';
        const isVideo = url.match(/\.(mp4|webm|ogg)($|\?)/i);
        let media;
        if (isVideo) {
            media = document.createElement('video');
            media.autoplay = true; media.loop = true; media.muted = true;
        } else {
            media = document.createElement('img');
        }
        media.id = "bg-media"; media.src = url;
        bgContainer.appendChild(media);
    }

    if (saveBgBtn && bgUrlInput) {
        saveBgBtn.addEventListener('click', () => {
            const url = bgUrlInput.value.trim();
            if(url) { 
                localStorage.setItem('myBackgroundUrl', url); 
                applyBackground(url); 
                toggleModal(false); 
            }
        });
    }

    if (resetBgBtn) {
        resetBgBtn.addEventListener('click', () => {
            localStorage.removeItem('myBackgroundUrl'); 
            if (bgContainer) bgContainer.innerHTML = ''; 
            toggleModal(false);
        });
    }

    // ==========================================
    // 7. DATA MIGRATION & TASK STATE
    // ==========================================
    function getSafeDateString(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function getLogicalDateStr() {
        const resetHour = parseInt(localStorage.getItem('userResetHour')) || 0;
        const now = new Date();
        now.setHours(now.getHours() - resetHour);
        return getSafeDateString(now);
    }

    const todayLogicalDateStr = getLogicalDateStr();
    let currentSelectedDateStr = todayLogicalDateStr;
    
    let tasksDB = JSON.parse(localStorage.getItem('tasksDB') || '{}');

    if (localStorage.getItem('myTasks')) {
        const oldTasks = JSON.parse(localStorage.getItem('myTasks'));
        if (oldTasks.length > 0) {
            tasksDB[todayLogicalDateStr] = oldTasks;
            localStorage.setItem('tasksDB', JSON.stringify(tasksDB));
        }
        localStorage.removeItem('myTasks'); 
    }

    function renderCustomList(tasksArr, readOnly = false) {
        if (!taskList) return;
        taskList.innerHTML = "";
        
        if (!tasksArr || tasksArr.length === 0) {
            taskList.innerHTML = "<li style='text-align:center; background:none; color: #a6adc8;'>Chưa có nhiệm vụ</li>";
            return;
        }

        tasksArr.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = task;
            if (!readOnly) {
                li.onclick = () => { 
                    tasksDB[currentSelectedDateStr].splice(index, 1);
                    localStorage.setItem('tasksDB', JSON.stringify(tasksDB));
                    renderCustomList(tasksDB[currentSelectedDateStr], false);
                    let parts = currentSelectedDateStr.split('-');
                    renderCalendar(parseInt(parts[1]) - 1, parseInt(parts[0])); 
                };
            } else {
                li.style.cursor = "default"; li.style.opacity = "0.7";
            }
            taskList.appendChild(li);
        });
    }

    if (listTitle) listTitle.style.display = 'none'; 
    renderCustomList(tasksDB[currentSelectedDateStr] || [], false);

    // ==========================================
    // 8. NHẬP TASK MỚI
    // ==========================================
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && taskInput.value.trim() !== "") {
                if (!tasksDB[currentSelectedDateStr]) {
                    tasksDB[currentSelectedDateStr] = [];
                }
                tasksDB[currentSelectedDateStr].push(taskInput.value);
                localStorage.setItem('tasksDB', JSON.stringify(tasksDB));
                
                renderCustomList(tasksDB[currentSelectedDateStr], false);
                taskInput.value = "";
                
                let parts = currentSelectedDateStr.split('-');
                renderCalendar(parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        });
    }

    // ==========================================
    // 9. NÚT RECHECK (Xem lại hôm qua)
    // ==========================================
    let isViewingHistory = false;
    if (recheckBtn) {
        recheckBtn.addEventListener('click', () => {
            isViewingHistory = !isViewingHistory;
            recheckBtn.classList.toggle('active', isViewingHistory);
            
            if (isViewingHistory) {
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                let yesterdayStr = getSafeDateString(yesterday);

                if(listTitle) {
                    listTitle.style.display = 'block';
                    listTitle.innerText = "Nhiệm vụ hôm qua:";
                    listTitle.style.color = "#a6adc8";
                }
                renderCustomList(tasksDB[yesterdayStr] || [], true);
                if(document.querySelector('.input-group')) document.querySelector('.input-group').style.display = 'none';
            } else {
                if(listTitle && currentSelectedDateStr === todayLogicalDateStr) {
                    listTitle.style.display = 'none';
                } else if (listTitle) {
                    listTitle.style.color = "#cdd6f4";
                }
                renderCustomList(tasksDB[currentSelectedDateStr] || [], false);
                if(document.querySelector('.input-group')) document.querySelector('.input-group').style.display = 'flex';
            }
        });
    }

    // ==========================================
    // 10. FOCUS MODE
    // ==========================================
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['focusModeStatus', 'focusDomain'], (result) => {
            if (result.focusModeStatus) activeFocusUI(true, result.focusDomain);
        });
    }

    if (toggleFocusBtn && focusInput) {
        toggleFocusBtn.addEventListener('click', () => {
            const isFocusing = toggleFocusBtn.classList.contains('focusing');
            if (!isFocusing) {
                let rawUrl = focusInput.value.trim();
                if (!rawUrl) return alert("Nhập link vào đã bro!");
                try {
                    if (!rawUrl.startsWith('http')) rawUrl = 'https://' + rawUrl;
                    const hostname = new URL(rawUrl).hostname;
                    if (typeof chrome !== 'undefined' && chrome.storage) {
                        chrome.storage.local.set({ focusModeStatus: true, focusDomain: hostname });
                    }
                    activeFocusUI(true, hostname);
                    alert(`Đã bật chế độ Focus: ${hostname}`);
                } catch (e) { alert("Link không hợp lệ!"); }
            } else {
                if (typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.set({ focusModeStatus: false });
                }
                activeFocusUI(false);
            }
        });
    }

    function activeFocusUI(isActive, domain = "") {
        if (!toggleFocusBtn || !focusInput) return;
        if (isActive) {
            toggleFocusBtn.textContent = "DỪNG LẠI";
            toggleFocusBtn.classList.add('focusing');
            focusInput.value = domain;
            focusInput.disabled = true;
        } else {
            toggleFocusBtn.textContent = "BẬT FOCUS";
            toggleFocusBtn.classList.remove('focusing');
            focusInput.disabled = false;
        }
    }

    // ==========================================
    // 11. KÉO THẢ (DRAG & DROP)
    // ==========================================
    const savedPos = JSON.parse(localStorage.getItem('menuPosition'));
    if (savedPos && mainContainer) {
        mainContainer.style.top = savedPos.top;
        mainContainer.style.left = savedPos.left;
        mainContainer.style.transform = "translate(0, 0)";
    }

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    if (dragHandle && mainContainer) {
        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragHandle.style.cursor = 'grabbing';
            startX = e.clientX;
            startY = e.clientY;
            const rect = mainContainer.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            
            mainContainer.style.transform = "none";
            mainContainer.style.left = initialLeft + "px";
            mainContainer.style.top = initialTop + "px";
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            mainContainer.style.left = `${initialLeft + dx}px`;
            mainContainer.style.top = `${initialTop + dy}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragHandle.style.cursor = 'grab';
                const pos = { left: mainContainer.style.left, top: mainContainer.style.top };
                localStorage.setItem('menuPosition', JSON.stringify(pos));
            }
        });
    }

    // ==========================================
    // 12. LỊCH (CALENDAR)
    // ==========================================
    if (calendarPopup && calendarBtn && calendarGrid) {
        let currentDate = new Date();
        let currMonth = currentDate.getMonth();
        let currYear = currentDate.getFullYear();

        calendarBtn.addEventListener('click', () => {
            calendarPopup.classList.toggle('active'); 
            // Nếu mở lịch thì đóng pomodoro cho gọn
            const pomodoroPopup = document.getElementById('pomodoro-popup');
            if (pomodoroPopup) pomodoroPopup.classList.remove('active');
            renderCalendar(currMonth, currYear);
        });

        if (closeCalendarBtn) {
            closeCalendarBtn.addEventListener('click', () => calendarPopup.classList.remove('active'));
        }

        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                currMonth--;
                if (currMonth < 0) { currMonth = 11; currYear--; }
                renderCalendar(currMonth, currYear);
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                currMonth++;
                if (currMonth > 11) { currMonth = 0; currYear++; }
                renderCalendar(currMonth, currYear);
            });
        }

        function renderCalendar(month, year) {
            const monthNames = [
                "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
            ];

            if(monthYearText) monthYearText.innerText = `${monthNames[month]} ${year}`;
            calendarGrid.innerHTML = ""; 

            let firstDay = new Date(year, month, 1).getDay(); 
            let daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDay; i++) {
                let emptyDiv = document.createElement('div');
                calendarGrid.appendChild(emptyDiv);
            }

            for (let i = 1; i <= daysInMonth; i++) {
                let dayDiv = document.createElement('div');
                dayDiv.classList.add('calendar-day');
                dayDiv.innerText = i;

                let cellDateStr = getSafeDateString(new Date(year, month, i));

                if (tasksDB[cellDateStr] && tasksDB[cellDateStr].length > 0) {
                    dayDiv.classList.add('has-task');
                }

                if (cellDateStr === todayLogicalDateStr) {
                    dayDiv.classList.add('current-day');
                }

                if (cellDateStr === currentSelectedDateStr) {
                    dayDiv.classList.add('selected-day');
                }

                dayDiv.addEventListener('click', () => {
                    currentSelectedDateStr = cellDateStr;
                    
                    if (listTitle) {
                        if (cellDateStr === todayLogicalDateStr) {
                            listTitle.style.display = 'none'; 
                        } else {
                            let displayDate = `${String(i).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
                            listTitle.innerText = `Nhiệm vụ: ${displayDate}`;
                            listTitle.style.display = 'block';
                            listTitle.style.color = "#fab387";
                        }
                    }

                    renderCustomList(tasksDB[currentSelectedDateStr] || [], false);
                    renderCalendar(month, year); 
                    calendarPopup.classList.remove('active');
                });

                calendarGrid.appendChild(dayDiv);
            }
        }
    }

    // ==========================================
    // 13. POMODORO TIMER
    // ==========================================
    const pomodoroPopup = document.getElementById('pomodoro-popup');
    const alarmBtn = document.getElementById('alarm-btn');
    const closePomodoro = document.getElementById('close-pomodoro');
    const pomodoroTime = document.getElementById('pomodoro-time');
    const startPauseBtn = document.getElementById('pomodoro-start-pause');
    const resetBtn = document.getElementById('pomodoro-reset');
    const modeButtons = document.querySelectorAll('.mode-btn');

    if (pomodoroPopup && alarmBtn) {
        let timerInterval = null;
        let isRunning = false;
        let secondsLeft = 25 * 60;
        let currentMode = 'focus';

        const modeDurations = {
            'focus': 25 * 60,
            'short-break': 5 * 60,
            'long-break': 15 * 60
        };

        // Bật tắt bảng Pomodoro (Dùng class active thay vì hidden)
        alarmBtn.addEventListener('click', () => {
            pomodoroPopup.classList.toggle('active');
            // Đóng lịch nếu đang mở cho đỡ rối
            if(calendarPopup) calendarPopup.classList.remove('active');
        });

        closePomodoro.addEventListener('click', () => {
            pomodoroPopup.classList.remove('active');
            // Đã xóa logic dừng timer ở đây để nó chạy ngầm
        });

        // Click ngoài bảng để đóng
        window.addEventListener('click', (e) => {
            if (e.target == pomodoroPopup) pomodoroPopup.classList.remove('active');
            if (e.target == calendarPopup) calendarPopup.classList.remove('active');
        });

        if (modeButtons) {
            modeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    modeButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentMode = btn.dataset.mode;
                    secondsLeft = modeDurations[currentMode];
                    updateTimerDisplay();
                    
                    // Đổi chế độ thì dừng đồng hồ luôn cho an toàn
                    if (timerInterval) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                        isRunning = false;
                        startPauseBtn.textContent = 'Start';
                    }
                });
            });
        }

        if (startPauseBtn) {
            startPauseBtn.addEventListener('click', () => {
                if (!isRunning) {
                    startTimer();
                    startPauseBtn.textContent = 'Pause';
                } else {
                    pauseTimer();
                    startPauseBtn.textContent = 'Start';
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                pauseTimer();
                secondsLeft = modeDurations[currentMode];
                updateTimerDisplay();
                startPauseBtn.textContent = 'Start';
            });
        }

        function startTimer() {
            if (timerInterval) return;
            isRunning = true;
            timerInterval = setInterval(() => {
                secondsLeft--;
                updateTimerDisplay();
                
                if (secondsLeft <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    isRunning = false;
                    startPauseBtn.textContent = 'Start';
                    
                    // Cảnh báo hết giờ
                    alert('⏰ HẾT GIỜ POMODORO!\nNghỉ ngơi tí đi ông giáo!');
                }
            }, 1000);
        }

        function pauseTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
                isRunning = false;
            }
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
            const seconds = (secondsLeft % 60).toString().padStart(2, '0');
            if (pomodoroTime) pomodoroTime.textContent = `${minutes}:${seconds}`;
        }
    }
});