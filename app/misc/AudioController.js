// Play audio
export const play = async (playbackObj, uri) => {
    try {
        return await playbackObj.loadAsync(
            { uri }, 
            { shouldPlay: true }
          );       
    } catch (error) {
        console.log('Error inside play helper method', error.message)
    }
}


// Pause audio
export const pause = async (playbackObj) => {
    try {
        return await playbackObj.setStatusAsync(
            { shouldPlay: false }
        );
                
    } catch (error) {
        console.log('Error inside pause helper method', error.message)
    }
}


// Resume audio
export const resume = async (playbackObj) => {
    try {
        return await playbackObj.playAsync();
    } catch (error) {
        console.log('Error inside resume helper method', error.message)
    }
}



// Select another audio
export const playNext = async (playbackObj, uri) => {
    try {
        await playbackObj.stopAsync();
        await playbackObj.unloadAsync();
        return await play(playbackObj, uri)
    } catch (error) {
        console.log('Error inside playNext helper method', error.message)
    }
}