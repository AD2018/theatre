// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import {getLanesByIds} from '$studio/animationTimeline/selectors'
import {addPointToLane, updatePointProps, removePointFromLane, updatePointConnector} from '$studio/animationTimeline/sagas'
import {type Point} from '$studio/animationTimeline/types'
import css from './LanesViewer.css'
import Lane from './Lane'
import cx from 'classnames'

type Props = WithRunSagaProps & {
  boxHeight: number,
  lanes: $FlowFixMe,
  laneIds: $FlowFixMe,
  splitLane: Function,
  panelWidth: number,
  duration: number,
  currentTime: number,
  focus: [number, number],
}

type State = {
  svgWidth: number,
  svgHeight: number,
  svgTransform: number,
  svgExtremums: [number, number],
  activeLaneId: string,
}

type PointProps = Point & {
  _isNormalized?: boolean,
}

class LanesViewer extends React.PureComponent<Props, State> {
  svgArea: $FlowFixMe

  // ??
  static colors = ['darkturquoise', 'orchid', 'mediumspringgreen', 'gold']

  constructor(props: Props) {
    super(props)

    this.state = {
      ...this._getSvgState(props),
      activeLaneId: props.laneIds[0],
    }
  }

  componentWillReceiveProps(newProps) {
    let activeLaneId = this.state.activeLaneId
    if (newProps.laneIds.find((id) => (id === activeLaneId)) == null) {
      activeLaneId = newProps.laneIds[0]
    }
    this.setState(() => ({...this._getSvgState(newProps), activeLaneId}))
  }

  titleClickHandler(e: SyntheticMouseEvent<>, laneId: string) {
    if (e.altKey) {
      return this.props.splitLane(laneId)
    }
    this.setActiveLane(laneId)
  }

  setActiveLane(activeLaneId: string) {
    this.setState(() => ({activeLaneId}))
  }

  _getSvgState(props) {
    const {boxHeight, duration, focus, panelWidth, lanes} = props
    const svgHeight = boxHeight - 14
    const svgWidth = duration / (focus[1] - focus[0]) * (panelWidth)
    const svgTransform = svgWidth * focus[0] / duration
    const svgExtremums = lanes.reduce((reducer, {extremums}) => {
      if (extremums[0] < reducer[0]) reducer[0] = extremums[0]
      if (extremums[1] > reducer[1]) reducer[1] = extremums[1]
      return reducer
    }, [0, 0])
    
    return {svgHeight, svgWidth, svgTransform, svgExtremums}
  }

  addPoint = (e: SyntheticMouseEvent<>) => {
    if (!(e.ctrlKey || e.metaKey)) return
    const {top, left} = this.svgArea.getBoundingClientRect()
    const t = e.clientX - left
    const value = e.clientY - top
    const handleLength = (this.props.focus[1] - this.props.focus[0]) / 30
    const pointProps: PointProps = {
      t: this._deNormalizeX(t),
      value: this._deNormalizeValue(value),
      handles: [-handleLength, 0, handleLength, 0],
      isConnected: false,
    }
    this.props.runSaga(addPointToLane, this.state.activeLaneId, pointProps)
  }

  removePoint = (laneId: number, pointIndex: number) => {
    this.props.runSaga(removePointFromLane, laneId, pointIndex)
  }

  updatePointConnector = (laneId: number, pointIndex: number, isConnected: boolean) => {
    this.props.runSaga(updatePointConnector, laneId, pointIndex, isConnected)
  }

  updatePointProps = (laneId: number, pointIndex: number, newProps: PointProps) => {
    let {_isNormalized, ...props} = newProps
    if (_isNormalized) props = this.deNormalizePointProps(props)
    this.props.runSaga(updatePointProps, laneId, pointIndex, props)
  }

  normalizePointProps = (pointProps: PointProps): PointProps => {
    const {t, value, handles} = pointProps
    return {
      ...pointProps,
      t: this._normalizeX(t),
      value: this._normalizeValue(value),
      handles: [
        this._normalizeX(handles[0]),
        this._normalizeY(handles[1]),
        this._normalizeX(handles[2]),
        this._normalizeY(handles[3]),
      ],
      _isNormalized: true,
    }
  }

  deNormalizePointProps = (pointProps: PointProps): Point => {
    const {_isNormalized, ...props} = pointProps
    const {t, value, handles} = props
    return {
      ...props,
      t: this._deNormalizeX(t),
      value: this._deNormalizeValue(value),
      handles: [
        this._deNormalizeX(handles[0]),
        this._deNormalizeY(handles[1]),
        this._deNormalizeX(handles[2]),
        this._deNormalizeY(handles[3]),
      ],
    }
  }

  _normalizeX(x: number) {
    return x * this.state.svgWidth / this.props.duration
  }

  _deNormalizeX(x: number) {
    return x * this.props.duration / this.state.svgWidth
  }

  _normalizeY(y: number) {
    const {svgHeight, svgExtremums} = this.state
    return - y * svgHeight / (svgExtremums[1] - svgExtremums[0])
  }

  _deNormalizeY(y: number) {
    const {svgHeight, svgExtremums} = this.state
    return - y * (svgExtremums[1] - svgExtremums[0]) / svgHeight
  }

  _normalizeValue(value: number) {
    return this._normalizeY(value - this.state.svgExtremums[1])
  }

  _deNormalizeValue(value: number) {
    return this.state.svgExtremums[1] + this._deNormalizeY(value)
  }

  render() {
    const {lanes} = this.props
    const {svgHeight, svgWidth, svgTransform, activeLaneId} = this.state
    const shouldSplit = (lanes.length > 1)
    return (
      <div className={css.container}>
        <div className={css.titleBar}>
          {lanes.map(({id, component, property}, index) => (
            <div
              key={id}
              className={cx(css.title, {[css.activeTitle]: shouldSplit && id === activeLaneId})}
              {...(shouldSplit ? {onClick: (e) => this.titleClickHandler(e, id)} : {})}>
              <div className={css.componentName}>{component}</div>
              <div className={css.propertyName} style={{color: LanesViewer.colors[index%4]}}>{property}</div>
            </div>
          ))
          }
        </div>
        <div className={css.svgArea}>
          <svg
            height={svgHeight}
            width={svgWidth}
            style={{transform: `translateX(${-svgTransform}px)`}}
            ref={(svg) => {this.svgArea = svg}}
            onClick={this.addPoint}>
            {
              lanes.map(({id, points}, index) => (
                <Lane
                  key={id}
                  laneId={id}
                  points={points}
                  color={LanesViewer.colors[index%4]}
                  normalizePointProps={this.normalizePointProps}
                  updatePointProps={(index, newProps) => this.updatePointProps(id, index, newProps)}
                  removePointFromLane={(index) => this.removePoint(id, index)}
                  addConnector={(index) => this.updatePointConnector(id, index, true)}
                  removeConnector={(index) => this.updatePointConnector(id, index, false)}/>
              ))
            }
          </svg>
        </div>
      </div>
    )
  }
}

export default compose(
  connect(
    (state: $FlowFixMe, ownProps: $FlowFixMe) => {
      return {
        lanes: getLanesByIds(state, ownProps.laneIds),
      }
    }
  ),
  withRunSaga(),
)(LanesViewer)