import React, { Component } from "react";
import { View, StyleSheet, Text, ScrollView, Dimensions } from "react-native";
import { AudioContext } from "../context/AudioProvider";
import { RecyclerListView, LayoutProvider } from "recyclerlistview";
import AudioListItem from "../components/AudioListItem";
import Screen from "../components/Screen";
import OptionModal from "../components/OptionModal";
import { Audio } from "expo-av";
import { pause, play, resume, playNext } from "../misc/AudioController";
import { storeAudioForNextOpening } from "../misc/helper";

export class AudioList extends Component {
  static contextType = AudioContext;

  constructor(props) {
    super(props);
    this.state = {
      OptionModalVisible: false,
    };

    this.currentItem = {};
  }

  layoutProvider = new LayoutProvider(
    (i) => "audio",
    (type, dim) => {
      switch (type) {
        case "audio":
          dim.width = Dimensions.get("window").width;
          dim.height = 70;
          break;
        default:
          dim.width = 0;
          dim.height = 0;
      }
    }
  );

  //ALTERNATIVA CON setOnPlaybackStatusUpdate PERO NO FUNCIONÓ CORRECTAMENTE EL SLIDER
  onPlaybackStatusUpdate = async playbackStatus => {  
      // Verifica si el estado de reproducción está cargado y está reproduciéndose
      // if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
      //   // Actualiza el estado utilizando el contexto
      //   this.context.updateState(this.context, {
      //     playbackPosition: playbackStatus.positionMillis, // Posición actual de reproducción
      //     playbackDuration: playbackStatus.durationMillis, // Duración total del audio
      //   });
      // }

      // Reproducir el siguiente audio si el actual termina
      if (playbackStatus.didJustFinish) {
        const nextAudioIndex = this.context.currentAudioIndex + 1;
      
        if (nextAudioIndex >= this.context.totalAudioCount) {
          await this.context.playbackObj.unloadAsync();
          console.log("All audio files have been played. Stopping playback.");
          
          this.context.updateState(this.context, {
            soundObj: null,
            currentAudio: this.context.audioFiles[0],
            isPlaying: false,
            currentAudioIndex: 0,
            playbackPosition: null,
            playbackDuration: null,
          });
          return 
        }
      
        const audio = this.context.audioFiles[nextAudioIndex];
        const status = await playNext(this.context.playbackObj, audio.uri);
        console.log("Playing another audio in sequence:", audio.filename);
      
        this.context.updateState(this.context, {
          soundObj: status,
          currentAudio: audio,
          isPlaying: true,
          currentAudioIndex: nextAudioIndex,
        });
        await storeAudioForNextOpening(audio, nextAudioIndex);
      }
     };


  //ALTERNATIVA DEL SLIDER CON startProgressUpdateInterval. 
  startProgressUpdateInterval = (playbackObj) => {
    // Evitar múltiples intervalos activos
    if (this.progressInterval) clearInterval(this.progressInterval);
  
    this.progressInterval = setInterval(async () => {
      try {
        const status = await playbackObj.getStatusAsync();
        if (status.isLoaded) {
          const { positionMillis, durationMillis, didJustFinish } = status;
  
          // Actualizar el estado del progreso
          this.context.updateState(this.context, {
            playbackPosition: positionMillis,
            playbackDuration: durationMillis,
          });
  
          // Reproducir siguiente audio si termina el actual
          if (didJustFinish) {
            this.stopProgressUpdateInterval();
            this.playNextAudio();
          }
        }
      } catch (error) {
        console.error("Error in progress update interval:", error.message);
      }
    }, 500); // Actualizar cada 500 ms
  };
  
  stopProgressUpdateInterval = () => {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  };
  
  playNextAudio = async () => {
    const { playbackObj, currentAudioIndex, audioFiles, updateState } = this.context;
    const nextAudioIndex = currentAudioIndex + 1;
  
    if (nextAudioIndex >= audioFiles.length) {
      // Si no hay más audios, detener la reproducción
      await playbackObj.stopAsync();
      await playbackObj.unloadAsync();      
      return updateState(this.context, {
        soundObj: null,
        currentAudio: audioFiles[0],
        isPlaying: false,
        currentAudioIndex: 0,
        playbackPosition: null,
        playbackDuration: null,
      });
    }
  
    const nextAudio = audioFiles[nextAudioIndex];
    const status = await playNext(playbackObj, nextAudio.uri);
  
    updateState(this.context, {
      currentAudio: nextAudio,
      soundObj: status,
      isPlaying: true,
      currentAudioIndex: nextAudioIndex,
    });
  };
  
  handleAudioPress = async (audio) => {
    const { 
      soundObj, 
      playbackObj, 
      currentAudio, 
      updateState, 
      audioFiles 
    } = this.context;
  
    try {
      // Primera reproducción
      if (soundObj === null) {
        const playbackObj = new Audio.Sound();               
        const status = await play(playbackObj, audio.uri);
        const index = audioFiles.indexOf(audio);
  
        storeAudioForNextOpening(audio, index);
        console.log("Playing audio:", audio.filename);
  
        this.startProgressUpdateInterval(playbackObj);
  
        updateState(this.context, {
          currentAudio: audio,
          playbackObj,
          soundObj: status,
          isPlaying: true,
          currentAudioIndex: index,
        });  
        return 
      }
  
      // Pausar audio
      if (soundObj.isLoaded && soundObj.isPlaying && currentAudio.id === audio.id) {
        const status = await pause(playbackObj);
        console.log("Audio paused");
  
        updateState(this.context, {
          soundObj: status,
          isPlaying: false,
        });
  
        return;
      }
  
      // Reanudar audio
      if (soundObj.isLoaded && !soundObj.isPlaying && currentAudio.id === audio.id) {
        const status = await resume(playbackObj);
        console.log("Audio resumed");
  
        updateState(this.context, {
          soundObj: status,
          isPlaying: true,
        });
  
        return;
      }
  
      // Reproducir otro audio
      if (soundObj.isLoaded && currentAudio.id !== audio.id) {
        const index = audioFiles.indexOf(audio);
        const status = await playNext(playbackObj, audio.uri);                      
        console.log("Playing another audio:", audio.filename);
        
        playbackObj.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate);
        storeAudioForNextOpening(audio, index);
  
        this.stopProgressUpdateInterval();
        this.startProgressUpdateInterval(playbackObj);  
  
        updateState(this.context, {
          currentAudio: audio,
          soundObj: status,
          isPlaying: true,
          currentAudioIndex: index,
        });  
        return 
      }
    } catch (error) {
      console.error("Error in handleAudioPress:", error.message);
    }
  };  

  componentDidMount() {
    this.context.loadPreviousAudio();
  }

  rowRenderer = (type, item, index, extendedState) => {
    return (
      <AudioListItem
        title={`🤘🏻 ${item.filename}`}
        isPlaying={extendedState.isPlaying}
        activeListItem={this.context.currentAudioIndex === index}
        duration={item.duration}
        onAudioPress={() => this.handleAudioPress(item)}
        onOptionPress={() => {
          this.currentItem = item;
          this.setState({ ...this.state, OptionModalVisible: true });
          console.log("opening option");
        }}
      />
    );
  };
  render() {
    return (
      <AudioContext.Consumer>
        {({ dataProvider, isPlaying }) => {  
          if(!dataProvider._data.length) return null;       
          return (
            <Screen>
              <RecyclerListView
                style={styles.item}
                dataProvider={dataProvider}
                layoutProvider={this.layoutProvider}
                rowRenderer={this.rowRenderer}
                extendedState={{ isPlaying }}
              />
              <OptionModal
                onPlayPress={() => console.log("Playing audio")}
                onPlayListPress={() => console.log("Adding to the PlayList")}
                currentItem={this.currentItem}
                onClose={() => {
                  console.log("closing option");
                  this.setState({ ...this.state, OptionModalVisible: false });
                }}
                visible={this.state.OptionModalVisible}
              />
            </Screen>
          );
        }}
      </AudioContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
  },
  contentContainer: {
    padding: 10,
  },
  item: {
    flex: 1,
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
});

export default AudioList;




