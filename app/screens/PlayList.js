import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, ScrollView, Touchable, TouchableOpacity, FlatList, Alert } from "react-native";
import { play } from "../misc/AudioController";
import color from "../misc/color";
import PlaListInputModal from "../components/PlayListInputModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioContext } from "../context/AudioProvider";

const PlayList = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const context = useContext(AudioContext);
    const {playList, addToPlayList, updateState} = context;    

    const createPlayList = async playListName => {
        const result = await AsyncStorage.getItem('playList');
        if(result !== null){
            const audios = [];
            if(addToPlayList) {
                audios.push(addToPlayList);
            }
            const newList = {
                id: Date.now(),
                title: playListName,
                audios: audios                
            }

            const updateList = [...playList, newList];
            updateState(context, {addToPlayList: null, playList: updateList});          
            await AsyncStorage.setItem('playList', JSON.stringify(updateList));
        }
        setModalVisible(false);
    }

    const renderPlayList = async () => {
        const result = await AsyncStorage.getItem('playList');
        if(result === null){
            const defaultPlayList = {
                id: Date.now(),
                title: '🤘🏻 My Best Fucking Metal Songs 🤘🏻',
                audios: []
            }
            const newPlayList = [...playList, defaultPlayList];
            updateState(context, {playList: [...newPlayList]});
            return await AsyncStorage.setItem('playList', JSON.stringify([...newPlayList]));
        }

        updateState(context, {playList: JSON.parse(result)});
    }

    useEffect(() => {
        if(!playList.length){
            renderPlayList();
        }
    }, [])

    const handleBannerPress = async (playList) => {        
        if(addToPlayList) {            
            const result = await AsyncStorage.getItem('playList');

            let oldList = [];
            let updatedList = [];
            let sameAudio = false;

            if(result !== null){
                oldList = JSON.parse(result);
                updatedList = oldList.filter(list => {
                    if(list.id === playList.id){
                        //we want to check is that same audio is already our list or not
                        for(let audio of list.audios){
                            if(audio.id === addToPlayList.id){
                                //alert with some message
                                sameAudio = true;
                                return;
                            }

                        }
                        //otherwise update the playlist
                        list.audios = [...list.audios, addToPlayList];
                    }
                    return list;
                })
            }
            if(sameAudio){
                //alert with some message
                Alert.alert("Found same audio!", `${addToPlayList.filename} is already in ${playList.title}`);
                sameAudio = false;
                return updateState(context, {addToPlayList: null});
            }
            updateState(context, {addToPlayList: null, playList: [...updatedList]});
            return AsyncStorage.setItem('playList', JSON.stringify([...updatedList]));
        }
        //if there is no audio selected then we want open the list
        console.log('Open the list', playList.title);
    }

    return (
        <ScrollView contentContainerStyle style={styles.container}>           
            {playList.length 
                ? playList.map(item => (
                    <TouchableOpacity 
                        key={item.id.toString()}
                        style={styles.playListBanner}
                        onPress={() => handleBannerPress(item)}
                    >
                        <Text>
                            {`🤘🏻 ${item.title} 🤘🏻`}
                        </Text>
                        <Text 
                            style={styles.audioCount}>
                                {item.audios.length > 1 
                                ? `${item.audios.length} Songs` 
                                : `${item.audios.length} Song`}
                        </Text>
                    </TouchableOpacity>
                ))  
                : null 
            }        
                
            <TouchableOpacity 
                onPress={() => setModalVisible(true)} 
                style={{marginTop: 15}}>
                <Text 
                    style={styles.playListBtn}>+ Add New PlayList
                </Text>               
            </TouchableOpacity>
            <PlaListInputModal 
                visible={modalVisible} 
                onclose={() => setModalVisible(false)}
                onsubmit={createPlayList}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container:{
        padding: 20
    },
    audioCount: {
        marginTop: 3,
        opacity: 0.5,
        fontSize: 14,
    },  
    playListBanner: {
        padding: 5,
        backgroundColor: 'rgba(204, 204, 204, 0.3)',
        borderRadius: 5, 
        marginBottom: 10       
    },
    playListBtn: {
        color: color.MODAL_BG,
        letterSpacing: 1,
        fontWeight: 'bold',
        fontSize: 14,
        padding: 5,
    }
})

export default PlayList;

