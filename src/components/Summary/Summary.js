import React, { Component } from 'react'
import './Summary.css'
import { connect } from 'react-redux'
import AngleDown from 'react-icons/lib/fa/angle-down'
import Sound from '../../utils/Sound.js'


class Summary extends Component {
  constructor() {
    super()
    this.state = {
      scrambledText: '',
      summaryHeight: {},
      synth1IsPlaying: false,
    }
    this.summaryRef = null
    this.realText = `I'm a web developer with a background including construction, oil rigs, and university. I've dabbled with making web pages since I was in high school, and I've recently decided on a career switch into what I have more passion for. I'm also an alumni of the Lighthouse Labs Web Dev Bootcamp in Vancouver.\n\nOther than coding, in my spare time I enjoy playing guitar and producing music.`
    this.chars = `!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~`

    this.cssMinHeight = 192
    this.textBreakpointOne = 200 // For text un-scrambling on the way in, and height should stop increasing here
    this.textBreakpointTwo = 350 // For text scrambling on the way out

    this.synth1 = null

    this.freqFunction = this.freqFunction.bind(this)
  }

  componentWillMount = () => {
    const { scrollPosition } = this.props
    this.setState({
      summaryHeight: { height: scrollPosition + this.cssMinHeight},
    })

    this.instantiateSynth()
  }

  componentWillReceiveProps = (nextProps) => {
    const { scrollPosition } = nextProps

    /*================
      Scrambled Text
    ================*/
    if (scrollPosition < this.textBreakpointOne || scrollPosition > this.textBreakpointTwo) {
      let scrambledText = ''
      const lenChars = this.chars.length
      this.realText.split('').forEach(letter => {
        if (letter === ' ' || letter === '\n') {
          // Keeps the spaces
          scrambledText += letter
        }
        else if (Math.random() > (scrollPosition / this.textBreakpointOne) && scrollPosition < this.textBreakpointOne) {
          /* First text scramble
            The 'if' evaluates as true less often as scrollPosition increases, so causes scramble-amount to 'fade-out' */
          scrambledText += this.chars[Math.floor(Math.random() * lenChars)]
        }
        else if (Math.random() < ((scrollPosition / this.textBreakpointTwo) - 1) && scrollPosition > this.textBreakpointTwo) {
          /* Second text scramble
            The 'if' evaluates as true MORE often as scrollPosition increases, when past 2nd scrollPosition breakpoint */
          scrambledText += this.chars[Math.floor(Math.random() * lenChars)]
        }
        else {
          scrambledText += letter
        }
      })

      this.setState({
        scrambledText: scrambledText,
      })
    }


    /*=====================
      Height of the summary
    =====================*/
    this.setState({
      summaryHeight: { height: scrollPosition + this.cssMinHeight},
      // Max height of summary is determined by height of Section One element in App.css
    })

    /* Edge case fix:
      Sets menu to full open if past textBreakpoint, because of bug with scrolling really fast */
    if (scrollPosition >= this.textBreakpointOne) {
      this.setState({
        summaryHeight: { height: this.textBreakpointOne + this.cssMinHeight },
      })
    }


    /*===============
      Sound effects
    ===============*/
    const { isScrolling, scrollRate } = this.props
    const freq = this.freqFunction()

    // To play the sound:
    if (isScrolling && !this.state.synth1IsPlaying) {
      this.setState({ synth1IsPlaying: true }, () => {
        this.synth1.play(freq)
      })
    }

    // To adjust frequency
    this.synth1.frequency = freq
  }


  componentDidUpdate = () => {
    const { isScrolling } = this.props

    // To stop the sound:
    if (!isScrolling && this.state.synth1IsPlaying) {
      this.setState({ synth1IsPlaying: false }, () => {
        this.synth1.stop()
        // Re-create the sound object as required by Web Audio API
        this.instantiateSynth()
      })
    }
  }

  componentWillUnmount = () => {
    this.synth1.stop()
  }

  freqFunction = () => {
    const { scrollPosition: x } = this.props
    const { textBreakpointOne: h } = this
    const d = x < h ? 5 : 25 // Makes rise in freq slower on the way out
    const freq = (((x - h) ** 2) / d) + 20
    return freq <= 22050 ? freq : 22050
  }

  instantiateSynth = () => {
    // This needs to happen to replay sound
    this.synth1 = new Sound(this.props.audioContext, 'sawtooth')
  }


  render = () => {
    return (
      <div className="summary no-select" style={this.state.summaryHeight}>
        <div className="heading">
          <div className="name">
            Jon Gaspar
          </div>
          <div className="title">
            WEB DEVELOPER
          </div>
        </div>
        <div className="text">
          {
            this.props.scrollPosition < this.textBreakpointTwo ?
              (this.props.scrollPosition < this.textBreakpointOne ? this.state.scrambledText : this.realText) :
              (this.state.scrambledText)
          }
        </div>
        <AngleDown size={48}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    scrollPosition: state.scrollPosition,
    audioContext: state.audioContext,
    isScrolling: state.isScrolling,
    scrollRate: state.scrollRate,
  }
}

Summary = connect(mapStateToProps)(Summary)

export default Summary
