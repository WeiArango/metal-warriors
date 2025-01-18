import React from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import color from '../misc/color';

const PlayerButton = (props) => {
    const {
         iconType, 
         size = 50, 
         iconColor = color.MODAL_BG, 
         onPress,         
    } = props
    const getIconName = (type) => {
        switch (type) {
            case 'PLAY':
                return 'pausecircle'; //realted to play
            case 'PAUSED':
                return 'playcircleo'; //realted to pause
            case 'NEXT':
                return 'forward'; //realted to next
            case 'PREV':
                return 'banckward'; //realted to previous
                
                break;
        
            default:
                break;
        }
    }
    return(
        <AntDesign 
            {...props}
            onPress={onPress} 
            name={getIconName(iconType)} 
            size={size} 
            color = {iconColor} 
        />
    )
}

export default PlayerButton;
