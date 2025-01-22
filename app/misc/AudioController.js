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
        if (!playbackObj) {
            throw new Error("playbackObj is null");
        }

        await playbackObj.stopAsync();
        await playbackObj.unloadAsync();

        const status = await playbackObj.loadAsync({ uri }, { shouldPlay: true });
        return status;
    } catch (error) {
        console.error("Error in playNext:", error.message);
        throw error;
    }
}