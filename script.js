        // --- Piano Logic ---

        // 1. Setup
        const synth = new Tone.Synth().toDestination();
        const keys = document.querySelectorAll('.key');
        const recordButton = document.getElementById('recordButton');
        const playButton = document.getElementById('playButton');
        const statusDisplay = document.getElementById('statusDisplay');

        let isRecording = false;
        let songNotes = [];
        let recordingStartTime;

        // Map keyboard keys to their corresponding piano key elements
        const keyMap = {};
        keys.forEach(key => {
            keyMap[key.dataset.key] = key;
        });

        // 2. Playing Notes
        function playNote(note) {
            const keyElement = document.querySelector(`.key[data-note="${note}"]`);
            if (!keyElement) return;

            // Play the sound
            synth.triggerAttackRelease(note, "8n", Tone.now());

            // Add visual feedback
            keyElement.classList.add('active');
            setTimeout(() => keyElement.classList.remove('active'), 200);

            // If recording, save the note and its timestamp
            if (isRecording) {
                songNotes.push({
                    note: note,
                    time: Date.now() - recordingStartTime
                });
            }
        }

        // 3. Event Listeners for Keyboard
        window.addEventListener('keydown', e => {
            // Prevent repeating notes when a key is held down
            if (e.repeat) return;
            const keyElement = keyMap[e.key];
            if (keyElement) {
                playNote(keyElement.dataset.note);
            }
        });
        
        // Event listeners for mouse/touch interaction
        keys.forEach(key => {
            key.addEventListener('mousedown', () => playNote(key.dataset.note));
            key.addEventListener('touchstart', (e) => {
                e.preventDefault(); // prevent mouse events from firing
                playNote(key.dataset.note);
            });
        });

        // 4. Recording Logic
        recordButton.addEventListener('click', () => {
            isRecording = !isRecording;
            if (isRecording) {
                // Start recording
                songNotes = [];
                recordingStartTime = Date.now();
                recordButton.textContent = 'Stop';
                recordButton.classList.add('recording');
                statusDisplay.textContent = 'Recording...';
                playButton.disabled = true;
            } else {
                // Stop recording
                recordButton.textContent = 'Record';
                recordButton.classList.remove('recording');
                statusDisplay.textContent = songNotes.length > 0 ? 'Recording finished!' : 'Press a key to play';
                // Enable play button only if something was recorded
                playButton.disabled = songNotes.length === 0;
            }
        });

        // 5. Playback Logic
        playButton.addEventListener('click', () => {
            if (songNotes.length === 0) return;

            // Disable buttons during playback
            playButton.disabled = true;
            recordButton.disabled = true;
            statusDisplay.textContent = 'Playing back...';

            // Get the total duration of the song to re-enable buttons later
            const lastNoteTime = songNotes[songNotes.length - 1].time;

            songNotes.forEach(noteEvent => {
                setTimeout(() => {
                    playNote(noteEvent.note);
                }, noteEvent.time);
            });
            
            // Re-enable buttons after the song has finished playing
            setTimeout(() => {
                playButton.disabled = false;
                recordButton.disabled = false;
                statusDisplay.textContent = 'Playback finished!';
            }, lastNoteTime + 500); // Add a small buffer
        });
