import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions.js'
import regionsObj from './Regions';
import LoopStation from './LoopStation';

class Waveform extends Component {

    constructor(props) {
        super(props)
        this.state = {  
            data: null,
            regions: null,
            newBuffer: null
        }
    }

    componentDidMount() {

        this.el = ReactDOM.findDOMNode(this)
        this.waveform = this.el.querySelector('.wave')
        this.wavesurfer = WaveSurfer.create({
            container: this.waveform,
            waveColor: 'rgb(193, 193, 193)',
            progressColor: 'rgb(140, 140, 140)',
            cursorColor: 'orange',
            cursorWidth: 2,
            hideScrollbar: false,
            autoCenter: false,
            scrollParent: true,
            plugins: [
                RegionsPlugin.create({
                    slop: 8,
                    snapToGridInterval: 1,
                    regions: regionsObj
                })
            ]
        })
        

        ///////// Key Commands
        const triggerOnBtnOne = () => {
            this.wavesurfer.stop()
            let clip = this.wavesurfer.regions.list.pad1;
            clip.play()
        }

        const triggerOnBtnTwo = () => {
            this.wavesurfer.stop()
            let clip = this.wavesurfer.regions.list.pad2;
            clip.play()
        }
        
        const triggerOnBtnThree = () => {
            this.wavesurfer.stop()
            let clip = this.wavesurfer.regions.list.pad3;
            clip.play()
        }

        const triggerOnBtnFour = () => {
            this.wavesurfer.stop()
            let clip = this.wavesurfer.regions.list.pad4;
            clip.play()
        }

        const play = () => {
            this.wavesurfer.play()
        }

        const mute = () => {
            this.wavesurfer.toggleMute()
        }

        const stop = () => {
            this.wavesurfer.stop()
        }

        const slowed = () => {
            this.wavesurfer.setPlaybackRate((this.wavesurfer.getPlaybackRate(this.wavesurfer)) - 0.01)
        }

        const ogSpeed = () => {
            this.wavesurfer.setPlaybackRate(1)
        }

        const fast = () => {
            this.wavesurfer.setPlaybackRate((this.wavesurfer.getPlaybackRate(this.wavesurfer)) + 0.01)
        }

        const skipForward = () => {
            this.wavesurfer.skipForward(5)
        }

        const skipBackward = () => {
            this.wavesurfer.skipBackward(5)
        }

        //////////// Key Handler
        const handleKey = (e) => {
            e.stopPropagation()
            if(e.keyCode === 49){
                triggerOnBtnOne()
            } else if (e.keyCode === 50){
                triggerOnBtnTwo()
            } else if (e.keyCode === 51){
                triggerOnBtnThree()
            } else if (e.keyCode === 52){
                triggerOnBtnFour()
            } else if (e.keyCode === 83){
                stop()
            } else if (e.keyCode === 65){
                play()
            } else if (e.keyCode === 188){
                slowed()
            } else if (e.keyCode === 190){
                ogSpeed()
            } else if (e.keyCode === 191){
                fast()
            } else if (e.keyCode === 39){
                skipForward()
            } else if (e.keyCode === 37){
                skipBackward()
            } else if (e.keyCode === 192){
                mute()
            } 
        }

        this.wavesurfer.load(this.props.src);
        this.setState({ data: this.wavesurfer })
        window.addEventListener('keydown', handleKey);
    }


    playPause = () => {
        this.wavesurfer.playPause()
    }

    slowedSpeed = () => {
        this.wavesurfer.setPlaybackRate(0.75)
    }

    normalSpeed = () => {
        this.wavesurfer.setPlaybackRate(1)
    }

    stopBtn = () => {
        this.wavesurfer.stop()
    }

    onZoomIn = () => {
        this.wavesurfer.zoom(Number(50))
    }

    onZoomOut = () => {
        this.wavesurfer.zoom(Number(0))
    }

    copyBuffer = () => {
        this.wavesurfer.stop()
        let originalBuffer = this.wavesurfer.backend.buffer;

        let pad2Start = this.wavesurfer.regions.list.pad2.start;
        let pad2End = this.wavesurfer.regions.list.pad2.end;

        let emptySegment = this.wavesurfer.backend.ac.createBuffer(
            originalBuffer.numberOfChannels,
            // add 0.5 seconds to end of new empty buffer to allow region 'out' event to trigger -- ?
            ((pad2End - pad2Start) * originalBuffer.sampleRate) + 0.5,
            originalBuffer.sampleRate
        );

        for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
            let channelData = originalBuffer.getChannelData(i);
            let emptySegmentData = emptySegment.getChannelData(i);
            let newBufferData = channelData.subarray( (pad2Start * originalBuffer.sampleRate), (pad2End * originalBuffer.sampleRate));
            emptySegmentData.set(newBufferData);
        };

        this.setState({newBuffer: emptySegment});
        console.log('STATE OBJ:', this.state.newBuffer);
    }

    render() {
        return (
            <div className='waveform' onClick={this.handleSKey}>
            <div className='wave'>
            <div id="waveform"></div>
            <div id="wave-timeline"></div>
            <button onClick={this.playPause}>Play/Pause</button>
            <button onClick={this.slowedSpeed}>0.75</button>
            <button onClick={this.normalSpeed}>norm</button>
            <button onClick={this.stopBtn}>stop</button>
            <button onClick={this.onZoomOut}>-</button>
            <button onClick={this.onZoomIn}>+</button>
            <button onClick={this.copyBuffer}>Copy Buffer</button>
            </div>
            <li>a : play</li>
            <li>s : stop</li>
            <li>` : toggle mute</li>
            <li>, : speed - 1%</li>
            <li>. : speed 1</li>
            <li>/ : speed + 1%</li>
            <li>1 : trigger pad 1</li>
            <li>2 : trigger pad 2</li>
            <li>3 : trigger pad 3</li>
            <li>4 : trigger pad 4</li>
            <li>left : skip back 5 seconds</li>
            <li>right : skip forward 5 seconds</li>
            <br></br>
            <br></br>
            <span>copy buffer currently copies the contents of region 2 (above) into a new Audio Buffer/instance of wavesurfer below - working on getting it to loop</span>
            <br></br>
            <br></br>
            <span>TO DO - being able to copy the data from multiple regions in order to concatenate them into a new Audio Buffer/instance of wavesurfer below</span>
            <br></br>

            <LoopStation newBuffer={this.state.newBuffer}/>

        </div>
        )
    }

}

Waveform.defaultProps = {
    src: ""
}

export default Waveform
