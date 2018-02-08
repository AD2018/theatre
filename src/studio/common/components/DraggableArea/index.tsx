// @flow
import * as React from 'react'

type Props = {
  children: any,
  withShift?: boolean,
  onDragStart?: Function,
  onDragEnd?: Function,
  onDrag?: Function,
  shouldRegisterEvents?: boolean,
}

type State = {
  isDragging: boolean,
  startPos: {
    x: number,
    y: number,
  },
}

class DraggableArea extends React.Component<Props, {}> {
  s: State
  constructor(props: Props) {
    super(props)
    this.s = {
      isDragging: false,
      startPos: {
        x: 0,
        y: 0,
      },
    }
  }

  // componentWillUnmount() {
  //   this.removeDragListeners()
  // }

  addDragListeners() {
    document.addEventListener('mousemove', this.dragHandler)
    document.addEventListener('mouseup', this.dragEndHandler)
  }

  removeDragListeners() {
    document.removeEventListener('mousemove', this.dragHandler)
    document.removeEventListener('mouseup', this.dragEndHandler)
  }

  dragStartHandler = (e: SyntheticMouseEvent<*>) => {
    if (this.props.withShift && !e.shiftKey) return
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const {screenX, screenY} = e
    this.s.startPos = {x: screenX, y: screenY}
    // this.setState(() => ({
      // startPos: {x: screenX, y: screenY},
    // }))

    this.addDragListeners()
    this.props.onDragStart && this.props.onDragStart(e)
  }

  dragEndHandler = () => {
    this.removeDragListeners()
    this.props.onDragEnd && this.props.onDragEnd()
    // if (this.state.isDragging) {
    //   this.setState(() => ({isDragging: false}))
    // }
  }

  dragHandler = (e: MouseEvent) => {
    // if (!this.state.isDragging) this.setState(() => ({isDragging: true}))
    if (!this.s.isDragging) this.s.isDragging = true

    const {startPos} = this.s
    this.props.onDrag &&
      this.props.onDrag(e.screenX - startPos.x, e.screenY - startPos.y, e)
  }

  render() {
    const shouldRegisterEvents = (this.props.shouldRegisterEvents != null) ? this.props.shouldRegisterEvents : true
    return shouldRegisterEvents ? (
      React.cloneElement(this.props.children, {
        onMouseDown: this.dragStartHandler,
      })
    ) : (
      this.props.children
    )
      
  }
}

export default DraggableArea
