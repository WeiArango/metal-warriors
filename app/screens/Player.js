import React, { useContext, useEffect } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import Screen from "../components/Screen";
import color from "../misc/color"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import PlayerButton from "../components/PlayerButton";
import { AudioContext } from "../context/AudioProvider";
import { play, pause, resume, playNext } from "../misc/AudioController";
import { storeAudioForNextOpening } from "../misc/helper";

const {width} = Dimensions.get('window')

const Player = () => {
    const context = useContext(AudioContext);
    const {playbackPosition, playbackDuration} = context;

    const calculateSeekBar = () => {
        if(playbackPosition !== null && playbackDuration !== null) {
            return playbackPosition / playbackDuration;
        }    
        return 0
    };

    useEffect(() => {
        context.loadPreviousAudio();
    }, []);

    const handlePlayPause = async () => {
        //Play
        if(context.soundObj === null){
            const audio = context.currentAudio;
            const status = await play(context.playbackObj, audio.uri);            
            return context.updateState(context, {
                soundObj: status,
                currentAudio: audio,
                isPlaying: true,
                currentAudioIndex: context.currentAudioIndex,
            })
        }

        //Pause
        if(context.soundObj && context.soundObj.isPlaying){
            const status = await pause(context.playbackObj);            
            return context.updateState(context, {
                soundObj: status,
                isPlaying: false,
            });
        }

        //Resume
        if(context.soundObj && !context.soundObj.isPlaying){
            const status = await resume(context.playbackObj);            
            return context.updateState(context, {
                soundObj: status,
                isPlaying: true,
            });
        }
    }     

    const handleNext = async () => {
        const { isLoaded } = await context.playbackObj.getStatusAsync();
        const isLastAudio = context.currentAudioIndex + 1 === context.totalAudioCount;
        let audio;
        let index;
        let status;
      
        if (isLastAudio) {
          // Si es el último audio, reiniciar la lista desde el principio
          index = 0;
          audio = context.audioFiles[index];
          status = await playNext(context.playbackObj, audio.uri);
        } else {
          // Si no es el último audio, reproducir el siguiente
          index = context.currentAudioIndex + 1;
          audio = context.audioFiles[index];
          status = isLoaded ? await playNext(context.playbackObj, audio.uri) : await play(context.playbackObj, audio.uri);
        }
      
        console.log("Playing next audio:", audio.filename);
      
        context.updateState(context, {
          currentAudio: audio,
          playbackObj: context.playbackObj,
          soundObj: status,
          isPlaying: true,
          currentAudioIndex: index,
        });
      
        storeAudioForNextOpening(audio, index);
    };

    const handlePrevious = async () => {
        const { isLoaded } = await context.playbackObj.getStatusAsync();
        const isFirstAudio = context.currentAudioIndex === 0;
        let audio;
        let index;
        let status;
      
        if (isFirstAudio) {
          // Si es el primer audio, reproducir el último de la lista
          index = context.totalAudioCount - 1;
          audio = context.audioFiles[index];
          status = await playNext(context.playbackObj, audio.uri);
        } else {
          // Si no es el primer audio de la lista, reproducir el anterior
          index = context.currentAudioIndex - 1;
          audio = context.audioFiles[index];
          status = isLoaded ? await playNext(context.playbackObj, audio.uri) : await play(context.playbackObj, audio.uri);
        }
      
        console.log("Playing previous audio:", audio.filename);
      
        context.updateState(context, {
          currentAudio: audio,
          playbackObj: context.playbackObj,
          soundObj: status,
          isPlaying: true,
          currentAudioIndex: index,
        });
      
        storeAudioForNextOpening(audio, index);
    };

        
  

    if(!context.currentAudio) return null;

    return (
        <Screen>
            <View style={styles.container}>
                <Text style={styles.audioCount}>
                    {`${context.currentAudioIndex + 1} / ${context.totalAudioCount}`}
                </Text>
                <View style={styles.midBannerContainer}>
                    <MaterialCommunityIcons 
                    name="music-circle" 
                    size={300} 
                    color={context.isPlaying ? color.MODAL_BG : color.FONT_MEDIUM} />
                </View>
                <View style={styles.audioPlayerContainer}>
                    <Text numberOfLines={1} style={styles.audioTitle}>{context.currentAudio.filename}</Text>
                    <Slider
                        style={{width: width, height: 40}}
                        minimumValue={0}
                        maximumValue={1} 
                        value={calculateSeekBar()}
                        thumbTintColor={color.MODAL_BG}                      
                        minimumTrackTintColor={color.MODAL_BG}
                        maximumTrackTintColor={color.FONT_MEDIUM}
                    />
                    <View style={styles.audioControllers}>
                        <PlayerButton 
                            iconType='PREV'
                            onPress={handlePrevious}
                        />
                        <PlayerButton 
                            onPress={handlePlayPause}
                            style={{marginHorizontal: 30}} 
                            iconType={context.isPlaying ? 'PLAY' : 'PAUSE'}
                        />
                        <PlayerButton 
                        iconType='NEXT'
                        onPress={handleNext}
                        />                        
                    </View>
                </View>
            </View>
        </Screen>       
    )
}

const styles = StyleSheet.create({
    audioControllers:{
        width,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    container:{
        flex: 1,        
    }, audioCount: {
        textAlign: 'right',
        padding: 15,
        color: color.FONT_LIGHT,
        fontSize: 14,
    },
    midBannerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    audioTitle: {
        fontSize: 16,
        color: color.FONT,
        padding: 15
    }
})

export default Player;

