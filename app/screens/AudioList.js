import React, { Component } from "react";
import { View, StyleSheet, Text, ScrollView, Dimensions } from "react-native";
import { AudioContext } from "../context/AudioProvider";
import { RecyclerListView, LayoutProvider } from "recyclerlistview";
import AudioListItem from "../components/AudioListItem";
import Screen from "../components/Screen";
import OptionModal from "../components/OptionModal";
import { Audio } from 'expo-av';
import { pause, play, resume, playNext } from '../misc/AudioController'

export class AudioList extends Component {  
    static contextType = AudioContext

    constructor(props) {
      super(props);
      this.state = {
        OptionModalVisible: false,        
      }

      this.currentItem = {}
    }

    layoutProvider = new LayoutProvider(
      i => 'audio', 
      (type, dim) => {
        switch(type) {
          case 'audio':
            dim.width = Dimensions.get('window').width;
            dim.height = 70;
            break;
            default:
              dim.width = 0;
              dim.height = 0;
        }
    })

    onPlaybackStatusUpdate = playbackStatus => {      
      // Verifica si el estado de reproducción está cargado y está reproduciéndose
      if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
        // Actualiza el estado utilizando el contexto
        this.context.updateState(this.context, {
          playbackPosition: playbackStatus.positionMillis, // Posición actual de reproducción
          playbackDuration: playbackStatus.durationMillis, // Duración total del audio
        });
      }
    };

    handleAudioPress = async (audio) => {
      const {
        soundObj, 
        playbackObj, 
        currentAudio, 
        updateState, 
        audioFiles
      } = this.context;

      // Playing audio for the first time
      if(soundObj === null) {
        const playbackObj = new Audio.Sound()
        playbackObj.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate);
        const status = await play(playbackObj, audio.uri)    
        const index =  audioFiles.indexOf(audio)
        console.log('Playing audiofile:', audio.filename)    
        updateState(this.context, {
          currentAudio: audio,
          playbackObj: playbackObj, 
          soundObj: status,
          isPlaying: true,
          currentAudioIndex: index,
        });     
      }

      // Pause audio
      if(soundObj.isLoaded && soundObj.isPlaying && currentAudio.id === audio.id) {
        console.log('Audio is paused')        
        const status = await pause(playbackObj);
        return updateState(this.context, {
          soundObj: status, 
          isPlaying: false})        
      }

      // Resume audio
      if(soundObj.isLoaded && !soundObj.isPlaying && currentAudio.id === audio.id){
        const status = await resume(playbackObj);
        console.log('Audio is already playing')
        return updateState(this.context, {soundObj: status, isPlaying: true})         
      }

      // Select another audio
      if(soundObj.isLoaded && currentAudio.id !== audio.id) {
        const status = await playNext(playbackObj, audio.uri)
        const index =  audioFiles.indexOf(audio)
        console.log('Playing another audio:', audio.filename)
        return updateState(this.context, {
          currentAudio: audio,          
          soundObj: status,
          isPlaying: true,
          currentAudioIndex: index
        })
      }
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
            this.setState({...this.state, OptionModalVisible: true})
            console.log('opening option')
        }} 
        />
      );
    }
    render() {
        return(
          <AudioContext.Consumer>
            {({ dataProvider, isPlaying }) => {
              return (
                <Screen>
                  <RecyclerListView style={ styles.item }
                    dataProvider={dataProvider} 
                    layoutProvider={this.layoutProvider} 
                    rowRenderer={this.rowRenderer}
                    extendedState={{ isPlaying }}
                    />
                    <OptionModal
                      onPlayPress={() => 
                        console.log('Playing audio')} 
                      onPlayListPress={() => 
                        console.log('Adding to the PlayList')}
                      currentItem = {this.currentItem}
                      onClose={() => {
                        console.log('closing option')
                        this.setState({...this.state, OptionModalVisible: false})} 
                      } 
                      visible={this.state.OptionModalVisible}  
                                          
                    />
                </Screen>
              )
            }}
          </AudioContext.Consumer>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,      
      fontSize: 16,
      fontWeight: "800"
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

