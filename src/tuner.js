import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import PitchFinder from 'pitchfinder';

const MainScreen = () => {
  const [middleA] = useState(440);
  const [semitone] = useState(69);
  const [noteStrings] = useState([
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ]);
  const [sampleRate] = useState(22050);
  const [bufferSize] = useState(2048);
  const [pitchFinder] = useState(new PitchFinder.YIN({ sampleRate: sampleRate }));
  const [audioSubscription, setAudioSubscription] = useState(null);
  const [audioRecording, setAudioRecording] = useState(null);

  useEffect(() => {
    const start = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await recording.startAsync();

        const subscription = recording.setOnRecordingStatusUpdate(
          onRecordingStatusUpdate
        );
        setAudioSubscription(subscription);
        setAudioRecording(recording);
      } catch (error) {
        console.error('Failed to start recording', error);
      }
    };

    start();

    return () => {
      stop();
    };
  }, []);

  const stop = () => {
    if (audioSubscription) {
      audioSubscription.remove();
      setAudioSubscription(null);
    }

    if (audioRecording) {
      audioRecording.stopAndUnloadAsync();
      setAudioRecording(null);
    }
  };

  const onRecordingStatusUpdate = (status) => {
    if (status.isRecording) {
      const { audioData } = status;
      if (audioData) {
        const frequency = pitchFinder(audioData);
        if (frequency && onNoteDetected) {
          const note = getNote(frequency);
          onNoteDetected({
            name: noteStrings[note % 12],
            value: note,
            cents: getCents(frequency, note),
            octave: parseInt(note / 12) - 1,
            frequency: frequency,
          });
        }
      }
    }
  };

  /**
   * get musical note from frequency
   *
   * @param {number} frequency
   * @returns {number}
   */
  const getNote = (frequency) => {
    const note = 12 * (Math.log(frequency / middleA) / Math.log(2));
    return Math.round(note) + semitone;
  };

  /**
   * get the musical note's standard frequency
   *
   * @param note
   * @returns {number}
   */
  const getStandardFrequency = (note) => {
    return middleA * Math.pow(2, (note - semitone) / 12);
  };

  /**
   * get cents difference between given frequency and musical note's standard frequency
   *
   * @param {float} frequency
   * @param {int} note
   * @returns {int}
   */
  const getCents = (frequency, note) => {
    return Math.floor(
      (1200 * Math.log(frequency / getStandardFrequency(note))) /
        Math.log(2)
    );
  };

  // Add your component JSX and other logic here

  return null;
};

export default MainScreen;