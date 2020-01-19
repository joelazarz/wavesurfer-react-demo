import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions.js'

export class LoopStation extends Component {

  componentDidMount() {

    this.el = ReactDOM.findDOMNode(this)
    this.waveform = this.el.querySelector('.loop-wave')
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
            loopSelection: true
          })
        ]
    })
  }
  
  playLooped = () => {
    let clip = this.wavesurfer.regions.list.loop;
    clip.playLoop()
  }
  
  loadBuffer = () => {
    console.log(this.props.newBuffer)
    this.wavesurfer.loadDecodedBuffer(this.props.newBuffer)

    let endPoint = parseFloat(this.wavesurfer.getDuration())

    let loopRegion = {
      id: 'loop',
      start: 0,
      end: endPoint,
      loop: true,
      color: 'rgb(255, 82, 82, 0.4)',
    }

    this.wavesurfer.addRegion(loopRegion)

  }



  render() {
    return (
      <div className="loop-station">
        <div className="loop-wave">
        <button onClick={this.loadBuffer}>Load Buffer</button>
        <button onClick={this.playLooped}>Play Loop</button>
          <div id="loop-waveform"></div>
        </div>
        
      </div>
    )
  }
}

export default LoopStation
