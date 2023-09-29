let mediaRecorder;
let audioChunks = [];
let audioPlayer = document.getElementById('audioPlayer');
let startRecordingButton = document.getElementById('record');
let pauseRecordingButton = document.getElementById('pause');
let stopRecordingButton = document.getElementById('stop');
let playAudioButton = document.getElementById('play');
let audioFormat = document.getElementById('audioFormat')
let saveToComputerButton = document.getElementById('saveToComputer')

const liveWaveform = WaveSurfer.create({
    container: '#liveWaveform',
    waveColor: 'black',
    progressColor: 'grey',
});

pauseRecordingButton.disabled = true;
stopRecordingButton.disabled = true;

// Get user media to record audio
navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);

        // Handle data available from the recorder
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        // Start recording when the "Start Recording" button is clicked
        startRecordingButton.addEventListener('click', () => {
            audioChunks = []; // Reset the chunks
            mediaRecorder.start();
            startRecordingButton.disabled = true;
            pauseRecordingButton.disabled = false;
            stopRecordingButton.disabled = false;
        });

        // Pause recording when the "Pause Recording" button is clicked
        pauseRecordingButton.addEventListener('click', () => {
            mediaRecorder.pause();
            pauseRecordingButton.disabled = true;
            startRecordingButton.disabled = false;
            saveToComputerButton.disabled = false;

        });

        // Resume recording when the "Pause Recording" button is clicked again
        startRecordingButton.addEventListener('click', () => {
            mediaRecorder.resume();
            startRecordingButton.disabled = true;
            pauseRecordingButton.disabled = false;
        });

        // Stop recording when the "Stop Recording" button is clicked
        stopRecordingButton.addEventListener('click', () => {
            mediaRecorder.stop();
            startRecordingButton.disabled = false;
            pauseRecordingButton.disabled = true;
            stopRecordingButton.disabled = true;
            saveToComputerButton.disabled = false;
        });

        // Handle the recording stopping event
        mediaRecorder.onstop = () => {
            // Create a Blob from the audio chunks
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

            // Create a URL for the Blob
            const audioUrl = URL.createObjectURL(audioBlob);

            // Set the audio player source and enable the "Play Audio" button
            audioPlayer.src = audioUrl;
            playAudioButton.disabled = false;
        };
    })
    .catch((error) => {
        console.error('Error accessing microphone:', error);
    });

    audioPlayer.addEventListener('pause', () => {
        liveWaveform.pause();
    });
    
    // Optional: Event listener to resume the live waveform visualization
    audioPlayer.addEventListener('play', () => {
        liveWaveform.play();
    });
    
    // Optional: Event listener to stop the live waveform visualization
    audioPlayer.addEventListener('ended', () => {
        liveWaveform.stop();
    });

    // Play the audio when the "Play Audio" button is clicked
    playAudioButton.addEventListener('click', () => {
        audioPlayer.play();
        liveWaveform.load(audioPlayer.src);
        liveWaveform.play();
    });

//----------------------------------------------------------------------------------------------------------------------------

let selectedFormat = 'mp3'; // Default to MP3 format

// Event listener for format selection
audioFormat.addEventListener('change', (event) => {
    selectedFormat = event.target.value;
});

// Event listener for saving to computer
saveToComputerButton.addEventListener('click', () => {
    if (audioChunks.length === 0) {
        alert('No audio to save. Please record audio first.');
        return;
    }

    // Create a Blob from the audio chunks
    const audioBlob = new Blob(audioChunks, { type: `audio/${selectedFormat}` });

    // Generate a unique filename (you can customize this as needed)
    const timestamp = new Date().toISOString();
    const filename = `recorded_audio_${timestamp}.${selectedFormat}`;

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(audioBlob);
    downloadLink.download = filename;

    // Trigger the download
    downloadLink.click();
});

