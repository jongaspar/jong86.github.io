import React, { Component } from 'react'
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'

import chatty from './images/chatty.png'
import jungle from './images/jungle.gif'
import loopFun from './images/loopfun.gif'
import payItForward from './images/payitforward.gif'
import tinyApp from './images/tinyapp.png'
import trikiMaps from './images/trikimaps.gif'
import tuneProg from './images/tuneprog.gif'
import tweeter from './images/tweeter.gif'
import vanCleaning from './images/vancleaning.gif'


const projectsData = [
  {
    image: vanCleaning,
    title: `VanCleaning Service`,
    url: `https://github.com/jong86/cleaning-service-frontendweb`,
    bulletPoints: [
      `Client-facing website and a larger internal one for employees and admin to manage jobs`,
      `Rails for the back-end and Vue for the front-end`,
    ],
  },
  {
    image: tuneProg,
    title: `Tune Progresser`,
    url: `https://github.com/jong86/tuneprog`,
    bulletPoints: [
      `A mobile app that allows musicians to organize sections of songs visually on a map, by recording the parts inside individual recorder components that can be placed where desired on a 'map'`,
      `Uses React Native and Redux`,
    ],
  },
  {
    image: payItForward,
    title: `PayItForward`,
    url: `https://github.com/squillace91/payitforward`,
    bulletPoints: [
      `Volunteering platform with a token incentive`,
      `Lighthouse Labs group final project made in under 2 weeks`,
      `My contributions included: database, transaction logic, the contract page w/ chat, and homepage cards design`,
    ],
  },
  {
    image: trikiMaps,
    title: `Triki Maps`,
    url: `https://github.com/jong86/maps-wiki`,
    bulletPoints: [
      `Lighthouse Labs group midterm project`,
      `Collaborated with a team of four using Git to create a 'Wikimap'-style single-page website where users can create custom markers and make their own maps`,
      `My contributions included: Google Maps API, user interaction with the map`,
    ],
  },
  {
    image: jungle,
    title: `Jungle`,
    url: `https://github.com/jong86/jungle-rails`,
    bulletPoints: [
      `Lighthouse Labs solo project`,
      `An e-commerce Rails app`,
    ],
  },
  {
    image: chatty,
    title: `Chatty`,
    url: `https://github.com/jong86/chattyapp`,
    bulletPoints: [
      `Lighthouse Labs solo project`,
      `Simple real-time chat app using React, Express and Websockets`,
    ],
  },
  {
    image: tinyApp,
    title: `TinyApp`,
    url: `https://github.com/jong86/tinyapp`,
    bulletPoints: [
      `Lighthouse Labs solo project`,
      `Small full-stack app using Node and Express that allows users to shorten long URLs`,
    ],
  },
  {
    image: tweeter,
    title: `Tweeter`,
    url: `https://github.com/jong86/tweeter`,
    bulletPoints: [
      `Lighthouse Labs solo project`,
      `Twitter clone made with JQuery, Express, and MongoDB`,
    ],
  },
  {
    image: loopFun,
    title: `LoopFun`,
    url: `https://github.com/jong86/loopfun`,
    bulletPoints: [
      `Personal project`,
      `Drum machine and note sequencer that uses Javascript and Web Audio API to synthesize sounds`,
    ],
  },
]

class RenderProjects extends Component {
  constructor() {
    super()
    this.projectsData = projectsData
  }

  render = () => {
    console.log("RenderProjects props", this.props)
    const { isScrolling } = this.props
    const { projectsData } = this

    return projectsData.map(project =>
      <div className="project" key={uuidv4()}>
        <div className="image" key={uuidv4()}>
          <a href={ project.url } target="_blank">
            <img style={{display: isScrolling ? 'none' : 'initial'}} src={project.image} alt={project.title}/>
          </a>
        </div>
        <div style={{display: isScrolling ? 'none' : 'initial'}} className="description" key={uuidv4()}>
          <div className="project-title subtitle" key={uuidv4()}>
            <a href={ project.url } target="_blank">{ project.title }</a>
          </div>
          <ul>
            { project.bulletPoints.map((bulletPoint, j) =>
              <li key={uuidv4()}>
                { bulletPoint }
              </li>
            )}
          </ul>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    isScrolling: state.isScrolling,
  }
}

RenderProjects = connect(mapStateToProps)(RenderProjects)

export default RenderProjects
