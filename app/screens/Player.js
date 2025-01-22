import React, { useContext } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import Screen from "../components/Screen";
import color from "../misc/color"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import PlayerButton from "../components/PlayerButton";
import { AudioContext } from "../context/AudioProvider";

const {width} = Dimensions.get('window')

const Player = () => {
    const context = useContext(AudioContext);
    const {playbackPosition, playbackDuration} = context;
    const calculateSeekBar = () => {
        if(playbackPosition !== null && playbackDuration !== null) {
            return playbackPosition / playbackDuration;
        }    
        return 0
    }
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
                        <PlayerButton iconType='PREV'/>
                        <PlayerButton onPress={() => 
                            console.log('Playing from player')} 
                            style={{marginHorizontal: 30}} 
                            iconType={context.isPlaying ? 'PLAY' : 'PAUSE'}
                        />
                        <PlayerButton iconType='NEXT'/>                        
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

