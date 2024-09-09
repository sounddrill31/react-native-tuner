import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { StatusBar } from 'expo-status-bar';
import { Svg, Path } from 'react-native-svg';
import Tuner from "./tuner";
import Meter from "./meter";

export default class GuitarTunerApp extends Component {
  state = {
    note: {
      name: "A",
      octave: 4,
      frequency: 440,
      cents: 0,
    },
    isAutoMode: true,
  };

  _update(note) {
    this.setState({ note });
  }

  async componentDidMount() {
    if (Platform.OS === "android") {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      if (status !== 'granted') {
        console.log('Permission to access audio was denied');
        return;
      }
    }

    const tuner = new Tuner();
    tuner.start();
    tuner.onNoteDetected = (note) => {
      if (this._lastNoteName === note.name) {
        this._update(note);
      } else {
        this._lastNoteName = note.name;
      }
    };
  }

  toggleMode = () => {
    this.setState(prevState => ({ isAutoMode: !prevState.isAutoMode }));
  }

  renderGuitarHead() {
    const strings = ['E', 'A', 'D', 'G', 'B', 'E'];
    return (
      <View style={styles.guitarHead}>
        {strings.map((string, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.stringButton,
              this.state.note.name[0] === string && styles.activeString
            ]}
          >
            <Text style={styles.stringText}>{string}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  render() {
    const { note, isAutoMode } = this.state;
    const isPerfect = Math.abs(note.cents) < 5;

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>GUITAR TUNIO</Text>
          <Svg height="24" width="24" viewBox="0 0 24 24">
            <Path d="M12 15c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-9c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 14c-2.67 0-8-1.34-8-4v-2c0-2.66 5.33-4 8-4s8 1.34 8 4v2c0 2.66-5.33 4-8 4z" fill="#fff"/>
          </Svg>
        </View>

        <View style={styles.tunerContainer}>
          <View style={[styles.noteDisplay, isPerfect && styles.perfectNote]}>
            <Text style={styles.noteName}>{note.name}{note.octave}</Text>
            <Text style={styles.perfectText}>{isPerfect ? 'PERFECT' : ''}</Text>
          </View>
          <Meter cents={note.cents} />
          <Text style={styles.frequency}>{note.frequency.toFixed(1)} Hz</Text>
        </View>

        {this.renderGuitarHead()}

        <View style={styles.modeSwitch}>
          <Text style={styles.modeText}>Manual</Text>
          <Switch
            value={isAutoMode}
            onValueChange={this.toggleMode}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isAutoMode ? "#f5dd4b" : "#f4f3f4"}
          />
          <Text style={styles.modeText}>Auto</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tunerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  noteDisplay: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
  },
  perfectNote: {
    backgroundColor: '#4caf50',
  },
  noteName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  perfectText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  frequency: {
    fontSize: 24,
    color: '#bbb',
    marginTop: 10,
  },
  guitarHead: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  stringButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeString: {
    backgroundColor: '#4caf50',
  },
  stringText: {
    fontSize: 18,
    color: '#fff',
  },
  modeSwitch: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeText: {
    color: '#fff',
    marginHorizontal: 10,
  },
});