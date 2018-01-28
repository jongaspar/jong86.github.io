import React, { Component } from 'react'
import './Plate.css'
import { connect } from 'react-redux'
import AngleDown from 'react-icons/lib/fa/angle-down';


class Plate extends Component {
  constructor() {
    super()
    this.state = {
      obfuscatedText: '',
      plateHeight: {},
    }
    this.plateRef = null
    this.realText = `I'm a 31 year old web developer with a background including construction, oil rigs, and university. I've dabbled with making web pages since I was in high school, and I've recently decided to make the career switch into what I have more passion for. Other than coding, in my spare time I enjoy playing guitar and producing music.`
    this.chars = `!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~`

    this.textThresholdOne = 160
    this.textThresholdTwo = 350
  }

  componentWillMount = () => {
    this.setState({
      plateHeight: { height: this.props.viewPosition + 192},
    })
  }

  componentWillReceiveProps = (nextProps) => {
    const { viewPosition: lastViewPosition } = this.props
    const { viewPosition } = nextProps

    if (viewPosition < this.textThresholdOne || viewPosition > this.textThresholdTwo) {
      let obfuscatedText = ''
      const lenChars = this.chars.length

      this.realText.split('').forEach(letter => {
        if (letter === ' ') {
          // Keeps the spaces
          obfuscatedText += letter
        }
        else if (Math.random() > (viewPosition / this.textThresholdOne) && viewPosition < this.textThresholdOne) {
          /* First text scramble
            The 'if' evaluates as true less often as viewPosition increases, so causes scramble-amount to 'fade-out' */
          obfuscatedText += this.chars[Math.floor(Math.random() * lenChars)]
        }
        else if (Math.random() < ((viewPosition / this.textThresholdTwo) - 1) && viewPosition > this.textThresholdTwo) {
          /* Second text scramble
            The 'if' evaluates as true MORE often as viewPosition increases, when past 2nd viewPosition threshold */
            console.log('in here');
          obfuscatedText += this.chars[Math.floor(Math.random() * lenChars)]
        }
        else {
          obfuscatedText += letter
        }
      })

      this.setState({
        obfuscatedText: obfuscatedText,
        plateHeight: { height: viewPosition + 192},
      })
    }

    /* Edge case fix:
      Sets menu to full open if past textThreshold, because of bug with scrolling really fast */
    if (viewPosition >= this.textThresholdOne) {
      this.setState({
        plateHeight: { height: this.textThresholdOne + 192 },
      })
    }
  }

  render = () => {
    return (
      <div className="plate no-select" style={this.state.plateHeight}>
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
            this.props.viewPosition < this.textThresholdTwo ?
              (this.props.viewPosition < this.textThresholdOne ? this.state.obfuscatedText : this.realText) :
              (this.state.obfuscatedText)
          }
        </div>
        <AngleDown size={48}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    viewPosition: state.viewPosition,
    lastViewPosition: state.lastViewPosition,
  }
}

Plate = connect(mapStateToProps)(Plate)

export default Plate
