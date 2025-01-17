import React, { Component } from "react";
import { View, StyleSheet, Text, ScrollView, Dimensions } from "react-native";
import { AudioContext } from "../context/AudioProvider";
import { RecyclerListView, LayoutProvider } from "recyclerlistview";
import AudioListItem from "../components/AudioListItem";
import Screen from "../components/Screen";
import OptionModal from "../components/OptionModal";
import { Audio } from 'expo-av';

export class AudioList extends Component {  
    static contextType = AudioContext

    constructor(props) {
      super(props);
      this.state = {
        OptionModalVisible: false,
        playbackObj: null,
        soundObj: null,
        currentAudio: {}
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

    handleAudioPress = async (audio) => {
      // Playing audio for the first time
      if(this.state.soundObj === null) {
        const playbackObj = new Audio.Sound()
        const status = await playbackObj.loadAsync(
          {uri: audio.uri}, 
          {shouldPlay: true}
        );        
        console.log('pressed audio:', audio.filename)        
        return this.setState({
          ...this.state, 
          currentAudio: audio,
          playbackObj: playbackObj, 
          soundObj: status,
        });
      }

      // Pause audio
      if(this.state.soundObj.isLoaded && this.state.soundObj.isPlaying) {
        console.log('Audio is already playing')
        const status = await this.state.playbackObj.setStatusAsync({ shouldPlay: false });
        return this.setState({
          ...this.state,          
          soundObj: status,
        });
      }

      // Resume audio
      if(this.state.soundObj.isLoaded && !this.state.soundObj.isPlaying && this.state.currentAudio.id === audio.id){
        const status = await this.state.playbackObj.playAsync()
        return this.setState({
          ...this.state,          
          soundObj: status,
        });
      }
    }

    rowRenderer = (type, item) => {      
      return (
        <AudioListItem 
          title={`🤘🏻 ${item.filename}`} 
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
            {({ dataProvider }) => {
              return (
                <Screen>
                  <RecyclerListView style={ styles.item }
                    dataProvider={dataProvider} l
                    layoutProvider={this.layoutProvider} 
                    rowRenderer={this.rowRenderer}/>
                    <OptionModal
                      onPlayPress={() => 
                        console.log('Playing audio')} 
                      onPlayListPress={() => 
                        console.log('Adding to the PlayList')}
                      currentItem = {this.currentItem}
                      onClose={() => 
                        this.setState({...this.state, OptionModalVisible: false})} 
                      visible={this.state.OptionModalVisible} />
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

