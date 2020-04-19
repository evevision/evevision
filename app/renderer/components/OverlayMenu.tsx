import React, { Component } from "react";
import { AppState } from "../store";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Store from "electron-store";
import {IconProp} from "@fortawesome/fontawesome-svg-core";

const positionStore = new Store({ name: "window-positions" });

interface MenuProps {
    characterId: number;
    children: React.ReactNode;
    icon: IconProp;
    positionKey: string;
    defaultPosition: {left?: number, right?: number, top?: number, bottom?: number};
}

interface DragInfo {
    // note that in EVE dragging is done differently for the notification icon than for windows
    // it doesn't do any scaling when the game size changes, it simply offsets from a corner. we match that behaviour.

    // normally you wouldn't calculate the offset like this, but things can get strange with CSS-based positioning
    // so, we'll just make sure the right spot stays under the mouse
    offsetFromMouseX: number; // translation of box top left from mouse position at start of drag
    offsetFromMouseY: number; // same
    startX: number; // mouse start pos used to detect if they moved too early
    startY: number; // same
    waiting: boolean; // we wait 500ms before activating drag
}

interface MenuState {
    expanded: boolean;
    dragging?: DragInfo;
}

interface StoredMenuPosition {
    top: number | null;
    left: number | null;
    right: number | null;
    bottom: number | null;
}

class OverlayMenu extends Component<MenuProps, MenuState> {
    private menuRef: any;
    private expanderRef: any;

    private closeTimer?: NodeJS.Timeout;
    private dragWaitTimer?: NodeJS.Timeout;
    private positionSaveInterval?: NodeJS.Timeout;
    private hasUnsavedPosition: boolean = false; // if we have changed bounds and have not saved it

    constructor(props: MenuProps) {
        super(props);
        this.menuRef = React.createRef();
        this.expanderRef = React.createRef();
        this.state = {
            expanded: false,
        };
    }

    getPositionKey = (): string => {
        return "om-" + this.props.characterId + this.props.positionKey;
    }

    componentDidMount(): void {
        window.addEventListener("clearHover", this.handleClearHover);

        const menu = this.menuRef.current;
        const expander = this.expanderRef.current;

        if (positionStore.has(this.getPositionKey())) {
            const position = positionStore.get(
                this.getPositionKey()
            ) as StoredMenuPosition;
            menu.style.left = position.left ? position.left + "px" : null;
            menu.style.right = position.right ? position.right + "px" : null;
            menu.style.top = position.top ? position.top + "px" : null;
            menu.style.bottom = position.bottom ? position.bottom + "px" : null;

            // we don't have to set 'px' on expander cause it's just zero
            expander.style.left = position.left ? 0 : null;
            expander.style.right = position.right ? 0 : null;
            expander.style.top = position.top ? 0 : null;
            expander.style.bottom = position.bottom ? 0 : null;
        } else {
            menu.style.left = this.props.defaultPosition.left ? this.props.defaultPosition.left + "px" : null;
            menu.style.right = this.props.defaultPosition.right ? this.props.defaultPosition.right + "px" : null;
            menu.style.top = this.props.defaultPosition.top ? this.props.defaultPosition.top + "px" : null;
            menu.style.bottom = this.props.defaultPosition.bottom ? this.props.defaultPosition.bottom + "px" : null;
            expander.style.left = this.props.defaultPosition.left ? 0 : null;
            expander.style.right = this.props.defaultPosition.right ? 0 : null;
            expander.style.top = this.props.defaultPosition.top ? 0 : null;
            expander.style.bottom = this.props.defaultPosition.bottom ? 0 : null;
        }
        this.positionSaveInterval = setInterval(this.updatePositionStore, 1000);
    }

    componentWillUnmount(): void {
        window.removeEventListener("clearHover", this.handleClearHover);
        if (this.positionSaveInterval) {
            clearInterval(this.positionSaveInterval);
        }
    }

    updatePositionStore = () => {
        if (this.hasUnsavedPosition) {
            const style = this.menuRef.current.style;

            let storedPosition = {
                top: Math.max(style.top.replace("px", ""), 0),
                left: Math.max(style.left.replace("px", ""), 0),
                right: Math.max(style.right.replace("px", ""), 0),
                bottom: Math.max(style.bottom.replace("px", ""), 0)
            } as StoredMenuPosition;

            positionStore.set(this.getPositionKey(), storedPosition);
            this.hasUnsavedPosition = false;
        }
    };

    toggleExpand = () => {
        this.setState({ ...this.state, expanded: !this.state.expanded });
    };

    setExpanded = (expanded: boolean) => {
        this.setState({ ...this.state, expanded });
    };

    handleClearHover = () => {
        if (this.state.expanded && !this.closeTimer) {
            this.closeTimer = setTimeout(() => {
                this.setExpanded(false);
                this.closeTimer = undefined;
            }, 30000);
        }
    };

    handleMouseEnter = () => {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = undefined;
        }
    };

    finishWaiting = () => {
        if (this.state.dragging) {
            this.setState({
                ...this.state,
                dragging: { ...this.state.dragging, waiting: false }
            });
        }
    };

    stopDrag = (e: any) => {
        if (this.dragWaitTimer) {
            clearTimeout(this.dragWaitTimer);
            this.dragWaitTimer = undefined;
        }
        this.setState({ ...this.state, dragging: undefined });
        e.target.releasePointerCapture(e.pointerId);
    };

    handlePointerUp = (e: any) => {
        if (!this.state.dragging || this.state.dragging.waiting) {
            setImmediate(this.toggleExpand); // cant set state twice, ez fix
        }
        this.stopDrag(e);
    };

    handlePointerDown = (e: any) => {
        if (this.state.dragging || this.state.expanded) {
            return;
        }

        const menu = this.menuRef.current;

        const bounds = menu.getBoundingClientRect(); // top left of menu button

        const dragging: DragInfo = {
            offsetFromMouseX: bounds.x - e.clientX,
            offsetFromMouseY: bounds.y - e.clientY,
            startX: e.clientX,
            startY: e.clientY,
            waiting: true
        };

        e.target.setPointerCapture(e.pointerId);
        this.setState({ ...this.state, dragging: dragging });

        this.dragWaitTimer = setTimeout(this.finishWaiting, 250);
    };

    handlePointerMove = (e: any) => {
        if (this.state.dragging) {
            if (
                this.state.dragging.waiting &&
                (this.state.dragging.startX !== e.clientX ||
                    this.state.dragging.startY !== e.clientY)
            ) {
                this.stopDrag(e); // moved before finishing timer
            } else {
                const menu = this.menuRef.current;
                const expander = this.expanderRef.current;
                const newPosX = e.clientX + this.state.dragging.offsetFromMouseX;
                const newPosY = e.clientY + this.state.dragging.offsetFromMouseY;

                // depending on where it is, we need to set the position differently so it opens up in the correct direction
                const overlayWidth = window.innerWidth;
                const overlayHeight = window.innerHeight;
                const menuRect = menu.getBoundingClientRect();
                const menuWidth = menuRect.width;
                const menuHeight = menuRect.height;
                const alignLeft: boolean = newPosX < overlayWidth / 2; // align to left side if in left half of window
                const alignTop: boolean = newPosY < overlayHeight / 2; // align to top side if in top half of window

                menu.style.left = alignLeft ? newPosX + "px" : null;
                menu.style.right = alignLeft
                    ? null
                    : overlayWidth - (newPosX + menuWidth) + "px";
                menu.style.top = alignTop ? newPosY + "px" : null;
                menu.style.bottom = alignTop
                    ? null
                    : overlayHeight - (newPosY + menuHeight) + "px";

                expander.style.left = alignLeft ? 0 : null;
                expander.style.right = alignLeft ? null : 0;
                expander.style.top = alignTop ? 0 : null;
                expander.style.bottom = alignTop ? null : 0;

                this.hasUnsavedPosition = true;
            }
        }
    };

    render() {
        return (
            <div
                className={
                    "eve-overlay-menu " +
                    (this.state.expanded ? "expanded" : "collapsed") +
                    (this.state.dragging && !this.state.dragging.waiting
                        ? " dragging"
                        : "")
                }
                onMouseOver={this.handleMouseEnter}
                ref={this.menuRef}
            >
                <div
                    className="eve-overlay-menu-expander"
                    onPointerDown={this.handlePointerDown}
                    onPointerUp={this.handlePointerUp}
                    onPointerMove={this.handlePointerMove}
                    ref={this.expanderRef}
                >
                    <FontAwesomeIcon
                        icon={this.props.icon}
                        className={"eve-overlay-menu-expander-icon"}
                    />
                </div>
                <div className="eve-overlay-menu-contents">
                    {this.props.children}
                </div>
                <div className="eve-border-corner-top-left" />
                <div className="eve-border-corner-top-right" />
                <div className="eve-border-corner-bottom-right" />
                <div className="eve-border-corner-bottom-left" />
            </div>
        );
    }
}

const mapStateToProps = (_state: AppState, _ownProps: MenuProps) => {
    return {};
};

export default connect(mapStateToProps, {})(OverlayMenu);