import React, {Component} from 'react';

const initialState = {focused: false, hovered: false}
type State = Readonly<typeof initialState>
interface WindowProps {
  onRequestClose?: () => void,
  onRequestMinimize?: () => void,
  closeable: boolean,
  children: any; // ill figure this out later
}

export class Window extends Component<WindowProps, State> {

  constructor(props: WindowProps) {
    super(props)
  }

  readonly state: State = initialState

  private onFocus = () => this.setState({...this.state, focused: true})
  private onBlur = () => this.setState({...this.state, focused: false})

  private onMouseMove = () => {
    this.setState({...this.state, hovered: true});
  }

  private resetMouse = () => {
    this.setState({...this.state, hovered: false});
  }

  private closeWindow = () => {
    if(this.props.onRequestClose) {
      this.props.onRequestClose();
    }
  }

  private minimizeWindow = () => {
    if(this.props.onRequestMinimize) {
       this.props.onRequestMinimize()
    }
  }

  componentDidMount() {
    window.addEventListener("focus", this.onFocus)
    window.addEventListener("blur", this.onBlur)
    window.addEventListener("clearHover", this.resetMouse);
    window.addEventListener("mousemove", this.onMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener("focus", this.onFocus)
    window.removeEventListener("blur", this.onBlur)
    window.removeEventListener("clearHover", this.resetMouse);
    window.removeEventListener("mousemove", this.onMouseMove);
  }

  titlebarButtons() {
    return (
        <>
          {this.props.onRequestClose ? <div onClick={this.closeWindow} className="eve-window-titlebar-button">x</div> : null}
          {this.props.onRequestMinimize ? <div onClick={this.minimizeWindow} className="eve-window-titlebar-button">-</div> : null}
        </>
    )
  }

  render() {

    const { focused } = this.state
    const { children } = this.props
    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, { focused })
    );

    // onMouseEnter isn't going to fire again if the browser didn't see the cursor leave in the first place
    return (
      <div className="eve-window-container" id="eve-window-container">
        <div className={"eve-window" + (focused ? ' focused' : '')} id="eve-window">
          <div className="eve-window-titlebar">
            <div className="eve-window-titlebar-title">{document.title}</div>
            {this.state.hovered ? this.titlebarButtons() : null}
          </div>
          <div className="eve-window-contents">
            {childrenWithProps}
          </div>
        </div>
        <div className="eve-border-corner-top-left" />
        <div className="eve-border-corner-top-right" />
        <div className="eve-border-corner-bottom-right" />
        <div className="eve-border-corner-bottom-left" />
      </div>
    )
  }
}
