import React, { Component } from 'react';
import './App.css';

import Plate from './components/Plate/Plate.js'
import BgSpaceNodes from './components/BgSpaceNodes/BgSpaceNodes.js'

import action from './redux/action.js'
import { connect } from 'react-redux'

import throttle from 'lodash.throttle'


class App extends Component {
  constructor() {
    super()
    this.state = {
      sectionOneStyle: {},
    }
    this.sectionOneElmt = null
    this.sectionOneScrollThreshold = 225
    this.sectionOneVerticalCenter = null

    this.timeoutScroll = null
    this.handleScroll = this.handleScroll.bind(this);

    this.lastTime = null
    this.lastViewPosition = null
  }

  componentDidMount = () => {
    // Scroll to top of page on load:
    window.onbeforeunload = () => window.scrollTo(0,0)

    // Add scroll listener
    window.addEventListener('scroll', throttle(this.handleScroll, 1));

    this.setState({
      // Center Section One on page load
      sectionOneStyle: {
        top: (window.innerHeight / 2) - (this.sectionOneElmt.clientHeight / 2),
        opacity: 1.0,
      }
    })
    this.sectionOneVerticalCenter = (window.innerHeight / 2) - (this.sectionOneElmt.clientHeight / 2)
  }

  componentWillReceiveProps = (nextProps) => {
    const { viewPosition: lastViewPosition } = this.props
    const { viewPosition } = nextProps


    /* Edge case fix:
      Reinitializes Section One under threshold, because of bug with scrolling really fast */
    if (viewPosition < this.sectionOneScrollThreshold) {
      this.setState(prevState => ({
        sectionOneStyle: {
          top: this.sectionOneVerticalCenter,
          opacity: 1.0,
        }
      }))
    }

    // When scrolling
    if (Math.abs(viewPosition - lastViewPosition) > 0 && viewPosition > this.sectionOneScrollThreshold) {
      this.sectionOneVerticalCenter = (window.innerHeight / 2) - (this.sectionOneElmt.clientHeight / 2)
      this.setState(prevState => ({
        sectionOneStyle: {
          top: this.moveSectionOneVertically(viewPosition),
          opacity: this.fadeOpacity(viewPosition),
        }
      }))
    }
  }

  fadeOpacity = (viewPosition) => {
    return 1 - ((viewPosition / 800) ** 2)
  }

  moveSectionOneVertically = (viewPosition) => {
    return this.sectionOneVerticalCenter - (viewPosition - this.sectionOneScrollThreshold)
  }

  handleScroll = (event) => {
    const { setViewPosition, setIsScrolling, viewPosition } = this.props

    setViewPosition(document.documentElement.scrollTop)

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
    }, 50)
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
      this.lastViewPosition = viewPosition
    }
    const scrollRate = (
      (Math.abs(viewPosition - this.lastViewPosition) / (now - this.lastTime)) + 40
    )
    if (scrollRate) setScrollRate(scrollRate)
  }

  render = () => {
    return (
      <div className="App">
        <BgSpaceNodes/>
        <div
          className="section-one"
          style={this.state.sectionOneStyle}
          ref={(el) => { this.sectionOneElmt = el }}
        >
          <Plate/>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    viewPosition: state.viewPosition,
    isScrolling: state.isScrolling,
    audioContext: state.audioContext,
  }
}

function mapDispatchToProps(dispatch) {
  return({
    setViewPosition: (viewPosition) => {
      dispatch(action('SET_VIEW_POSITION', { viewPosition: viewPosition }))
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
