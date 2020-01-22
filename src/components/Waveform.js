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
            regions: [],
            bufferArr: [],
            concatenatedBuffers: null
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

    //////////////////////////////////////////
    // functions for copying audio buffer data
    // & concatenating them together

    copyRegionOne = () => {
        let regionOne = this.wavesurfer.regions.list.pad1;
        this.copyBuffer(regionOne);
    }

    copyRegionTwo = () => {
        let regionTwo = this.wavesurfer.regions.list.pad2
        this.copyBuffer(regionTwo)
    }

    copyRegionThree = () => {
        let regionThree = this.wavesurfer.regions.list.pad3
        this.copyBuffer(regionThree)
    }

    copyRegionFour = () => {
        let regionFour = this.wavesurfer.regions.list.pad4
        this.copyBuffer(regionFour)
    }

    copyBuffer = (region) => {
        this.wavesurfer.stop()
        var originalBuffer = this.wavesurfer.backend.buffer;

        var padStart = region.start;
        var padEnd = region.end;

        var emptySegment = this.wavesurfer.backend.ac.createBuffer(
            originalBuffer.numberOfChannels,
            ((padEnd - padStart) * originalBuffer.sampleRate),
            originalBuffer.sampleRate
        );

        for (var i = 0; i < originalBuffer.numberOfChannels; i++) {
            var channelData = originalBuffer.getChannelData(i);
            var emptySegmentData = emptySegment.getChannelData(i);
            let newBufferData = channelData.subarray((padStart * originalBuffer.sampleRate), (padEnd * originalBuffer.sampleRate));
            if (emptySegmentData.length === newBufferData.length) {
                emptySegmentData.set(newBufferData); // occassionally throws RangeError: Source is too large
            } else {
                console.log('RangeError: Source is too large - run else')
                let newBufferData = channelData.subarray((padStart * originalBuffer.sampleRate), (padEnd * originalBuffer.sampleRate) - 1); // maybe this is a fix?
                emptySegmentData.set(newBufferData); 
            };
        };
        
        this.setState({bufferArr: [...this.state.bufferArr, emptySegment]});
    }

    concatBuffer = () => {
        let stateBuffers = this.state.bufferArr;
        let ogBuffer = this.wavesurfer.backend.ac;
        let stateBuffersLength = stateBuffers.length;
        let channels = [];
        let totalDuration = 0;
    
        for(var a = 0; a < stateBuffersLength; a++){
            channels.push(stateBuffers[a].numberOfChannels);
            totalDuration += stateBuffers[a].duration; // length of new buffer - sum of every buffers length in state bufferArr
        };
    
        let numberOfChannels = channels.reduce(function(a, b) { return Math.min(a, b); });;
        let joinedBuffer = ogBuffer.createBuffer(numberOfChannels, ogBuffer.sampleRate * totalDuration, ogBuffer.sampleRate);
    
        for (var b = 0; b < numberOfChannels; b++) {
            var channel = joinedBuffer.getChannelData(b);
            var dataIndex = 0;
    
            for(var c = 0; c < stateBuffersLength; c++) {
                channel.set(stateBuffers[c].getChannelData(b), dataIndex);
                dataIndex += stateBuffers[c].length;// position to store the next buffer values
            };
        };

        this.setState({concatenatedBuffers: joinedBuffer});
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
            <button onClick={this.copyRegionOne}>Copy Region One</button>
            <button onClick={this.copyRegionTwo}>Copy Region Two</button>
            <button onClick={this.copyRegionThree}>Copy Region Three</button>
            <button onClick={this.copyRegionFour}>Copy Region Four</button>
            <button onClick={this.concatBuffer}>Concat buffers</button>
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

            <LoopStation concatenatedBuffers={this.state.concatenatedBuffers}/>

        </div>
        )
    }

}

Waveform.defaultProps = {
    src: ""
}

export default Waveform
