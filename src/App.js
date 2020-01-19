import React from 'react';
import Waveform from './components/Waveform';

function App() {

  let sound = "https://ia800909.us.archive.org/4/items/AltonEllisTheseEyes/Alton%20Ellis%20-%20These%20Eyes.mp3"
  // let sound = "https://ia802905.us.archive.org/17/items/MirtiloAltonEllisYouMakeMeHappy/Alton_Ellis__You_Make_Me_Happy_Studio_One_64kb.mp3"
  // let sound = "https://ia800204.us.archive.org/31/items/TheParagons-Twilight/12Twilight.mp3"

  return (
    <>
    <div className='parent-component'>
      <Waveform src={sound} />
    </div>
    </>
  );
}

export default App;
