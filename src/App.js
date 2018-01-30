import React, { Component } from 'react';
import './App.css';

import BgSpaceNodes from './components/BgSpaceNodes/BgSpaceNodes.js'
import Summary from './components/Summary/Summary.js'
import Skills from './components/Skills/Skills.js'

import { fadeOpacity, moveComponentVertically } from './utils/animation.js'

import action from './redux/action.js'
import { connect } from 'react-redux'

import throttle from 'lodash.throttle'

import Synth from './utils/Synth.js'
import { freqExp } from './utils/soundMod.js'


class App extends Component {
  constructor() {
    super()
    this.state = {
      sectionOneStyle: {},
      sectionTwoStyle: {},
    }

    // For isScrolling detection
    this.timeoutScroll = null
    this.handleScroll = this.handleScroll.bind(this);

    // For scroll rate
    this.lastTime = null
    this.lastScrollPosition = null
  }


  componentWillMount = () => {
    // Scroll to top of page on load:
    window.onbeforeunload = () => window.scrollTo(0,0)

    // Add scroll listener
    window.addEventListener('scroll', throttle(this.handleScroll, 8));

    this.setState({
      // Center Section One on page load
      sectionOneStyle: {
        top: '50%',
        opacity: 1.0,
      },
      sectionTwoStyle: {
        top: '125%',
        opacity: 0.0,
      }
    })

    this.instantiateSynth()
  }


  componentWillReceiveProps = (nextProps) => {
    const {
      scrollPosition: scrollPos,
      scrollBreakpoints: breakPt,
      isScrolling,
    } = nextProps

    /*========================
      Section One Animation
    ========================*/
    if (scrollPos <= breakPt[0]) {

      // Fix style if scrolled too fast
      this.setState({
        sectionOneStyle: {
          top: '50%',
          opacity: 1.0,
        },
      })
    }

    if (scrollPos <= breakPt[1]) {

      // Regular behavior
      if (scrollPos > breakPt[0]) {
        this.setState({
          sectionOneStyle: {
            top: moveComponentVertically('50%', '-25%', breakPt[0], breakPt[1], scrollPos),
            opacity: fadeOpacity('out', breakPt[0], breakPt[1], scrollPos),
          }
        })
      }

      // Fix style if scrolled too fast
      this.setState({
        sectionTwoStyle: {
          opacity: 0.0,
        }
      })
    }


    /*========================
      Section Two Animation
    ========================*/
    if (scrollPos > breakPt[1] && scrollPos <= breakPt[2]) {

      // Regular behavior
      this.setState({
        sectionOneStyle: {
          top: '-25%', // Positioned out of view
          opacity: 0.0,
        },
        sectionTwoStyle: {
          top: moveComponentVertically('125%', '50%', breakPt[1], breakPt[2], scrollPos),
          opacity: fadeOpacity('in', breakPt[1], breakPt[2], scrollPos),
        }
      })
    }

    // Fix style if scrolled too fast
    if (scrollPos > breakPt[2]) {
      this.setState({
        sectionTwoStyle: {
          top: '50%',
          opacity: 1.0,
        }
      })
    }




    /*===============
      Sound effect
    ===============*/

    // Adjust function for before / after breakPts
    let direction, breakPt1, breakPt2
    if (scrollPos <= breakPt[0]) {
      direction = 'down'
      breakPt1 = 0
      breakPt2 = breakPt[0]
    } else if (scrollPos > breakPt[0] && scrollPos <= breakPt[1]) {
      direction = 'up'
      breakPt1 = breakPt[0]
      breakPt2 = breakPt[1]
    } else if (scrollPos > breakPt[1] && scrollPos <= breakPt[2]) {
      direction = 'down'
      breakPt1 = breakPt[1]
      breakPt2 = breakPt[2]
    } else if (scrollPos > breakPt[2] && scrollPos <= breakPt[3]) {
      direction = 'up'
      breakPt1 = breakPt[2]
      breakPt2 = breakPt[3]
    }

    // Pitch modulation:
    const freq = freqExp(direction, breakPt1, breakPt2, 17000, 0, scrollPos)

    // To play the sound
    if (isScrolling && !this.synthIsPlaying) {
      this.synthIsPlaying = true
      this.synth.play(freq)
    }

    // To adjust sound frequency
    this.synth.frequency = freq
  }



  componentDidUpdate = () => {
    const { isScrolling } = this.props

    // To stop the sound:
    if (!isScrolling && this.synthIsPlaying) {
      this.synthIsPlaying = false
      this.synth.stop()
      // Re-create the sound object as required by Web Audio API
      this.instantiateSynth()
    }
  }


  instantiateSynth = () => {
    // This needs to happen to replay sound
    this.synth = new Synth(this.props.audioContext, 'triangle', 900, 400)
  }


  /*=======================
    Scroll event handler
  =======================*/
  handleScroll = (event) => {
    const { setScrollPosition, setIsScrolling, scrollPosition } = this.props

    /*======================================
      Save scroll position in redux store
    ======================================*/
    setScrollPosition(document.documentElement.scrollTop)


    /*===================================
      Save scroll state in redux store
    ===================================*/
    if (this.timeoutScroll) {
      // If there is already a timeout in process then cancel it
      clearTimeout(this.timeoutScroll)
    }
    this.timeoutScroll = setTimeout(() => {
      this.timeoutScroll = null
      setIsScrolling(false)
    }, 60)
    if (this.props.isScrolling !== true) {
      setIsScrolling(true)
    }


    /*==================================
      Save scroll rate in redux store
    ==================================*/
    const { audioContext, setScrollRate } = this.props

    const now = audioContext.currentTime
    if (!this.lastTime || (now - this.lastTime) > 0.025) {
      this.lastTime = audioContext.currentTime
      this.lastScrollPosition = scrollPosition
    }
    const scrollRate = (
      (Math.abs(scrollPosition - this.lastScrollPosition) / (now - this.lastTime)) + 40
    )
    if (scrollRate) setScrollRate(scrollRate)
  }


  /*=========
    Render
  =========*/
  render = () => {
    return (
      <div className="App">
        <BgSpaceNodes/>

        <div
          className="section-one"
          style={this.state.sectionOneStyle}
        >
          <Summary/>
        </div>

        <div
          className="section-two"
          style={this.state.sectionTwoStyle}
        >
          <Skills/>
        </div>

      </div>
    )
  }
}


/*=========
  Redux
=========*/
function mapStateToProps(state) {
  return {
    scrollPosition: state.scrollPosition,
    isScrolling: state.isScrolling,
    audioContext: state.audioContext,
    scrollBreakpoints: state.scrollBreakpoints,
  }
}

function mapDispatchToProps(dispatch) {
  return({
    setScrollPosition: (scrollPosition) => {
      dispatch(action('SET_SCROLL_POSITION', { scrollPosition: scrollPosition }))
    },
    setIsScrolling: (boolean) => {
      dispatch(action('SET_IS_SCROLLING', { boolean: boolean }))
    },
    setScrollRate: (scrollRate) => {
      dispatch(action('SET_SCROLL_RATE', { scrollRate: scrollRate }))
    }
  })
}

App = connect(mapStateToProps, mapDispatchToProps)(App)

export default App;
