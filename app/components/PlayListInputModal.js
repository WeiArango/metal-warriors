import React, { useState } from "react";
import { View, StyleSheet, Text, ScrollView, Dimensions, Modal, TouchableWithoutFeedback } from "react-native";
import { TextInput } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import color from "../misc/color";

const PlaListInputModal = ({visible, onclose, onsubmit }) => {

    const [playListName, setPlayListName] = useState('');
    const handleOnSubmit = () => {
        if(!playListName.trim()){            
            alert('Please Enter PlayList Name');
        } else {
            onsubmit(playListName);
            setPlayListName('');
            onclose();
        }
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.inputContainer}>
                    <Text>🤘🏻 Name Of The Fucking PlayList 🤘🏻</Text>
                    <TextInput value={playListName} onChangeText={(text) => setPlayListName(text)} style={styles.input}/>
                    <AntDesign 
                        name="check" 
                        size={24} 
                        color="black" 
                        style={styles.submitIcon}
                        onPress={handleOnSubmit}
                    />
                </View>
            </View>
            <TouchableWithoutFeedback 
                onPress={onclose}>
                <View style={[StyleSheet.absoluteFillObject, styles.modalBG]} />
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',        
    },
    inputContainer: {
        width: width - 20,
        height: 150,
        borderRadius: 10,        
        backgroundColor: color.APP_BG,
        justifyContent: 'center',        
        alignItems: 'center',
    },
    input: {
        width: width - 40,
        borderBottomWidth: 1,
        borderBottomColor: color.MODAL_BG,
        fontSize: 18,
        paddingVertical: 5,
    },
    submitIcon: {
        padding: 10,
        backgroundColor: color.MODAL_BG,
        color: 'white',
        borderRadius: 50,
        marginTop: 15
    },
    modalBG: {
        backgroundColor: color.MODAL_BG,
        zIndex: -1
    }
})

export default PlaListInputModal;
