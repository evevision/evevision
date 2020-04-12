import React from 'react';
import {SoundCloudWidget} from '../api/soundcloud';

interface SoundCloudPlayerProps {
    trackId: number
    paused: boolean
    volume: number
    onPositionChange?: (positionMilliseconds: number) => void
    onFinished?: () => void
}

class SoundCloudPlayer extends React.Component<SoundCloudPlayerProps> {
    private soundCloudWidget: any = null;
    private iframeRef: any = null;
    private propsQueue: SoundCloudPlayerProps[] = [];

    constructor(props: SoundCloudPlayerProps) {
        super(props);
        this.iframeRef = React.createRef();

        this.initSoundCloudWidget = this.initSoundCloudWidget.bind(this);
    }

    shouldComponentUpdate(nextProps: SoundCloudPlayerProps) {
        if (nextProps.trackId !== this.props.trackId) {
            return true;
        } else if (nextProps.volume !== this.props.volume || nextProps.paused !== this.props.paused) {
            this.propsQueue.push({...nextProps});
            this.processPropsQueue();
        }
        return false;
    }

    componentDidMount() {
        this.propsQueue.push({...this.props});
    }

    componentDidUpdate(prevProps: SoundCloudPlayerProps) {
        this.propsQueue.push({...this.props});
    }

    componentWillUnmount() {
        this.destroySoundCloudWidget();
    }

    initSoundCloudWidget() {
        this.destroySoundCloudWidget();
        this.soundCloudWidget = SoundCloudWidget(this.iframeRef.current);

        this.soundCloudWidget.bind(SoundCloudWidget.Events.READY, () => {
            this.processPropsQueue();
        });
        this.soundCloudWidget.bind(SoundCloudWidget.Events.PLAY_PROGRESS, (event: {currentPosition: number}) => {
            if (this.props.onPositionChange) {
                this.props.onPositionChange(event.currentPosition);
            }
        });
        this.soundCloudWidget.bind(SoundCloudWidget.Events.FINISH, () => {
            if (this.props.onFinished) {
                this.props.onFinished();
            }
        });
    }

    destroySoundCloudWidget() {
        if (this.soundCloudWidget) {
            this.soundCloudWidget.unbind(SoundCloudWidget.Events.READY);
            this.soundCloudWidget.unbind(SoundCloudWidget.Events.PLAY_PROGRESS);
            this.soundCloudWidget.unbind(SoundCloudWidget.Events.FINISH);
            this.soundCloudWidget = null;
        }
    }

    processPropsQueue() {
        // Process the queue of prop changes that have occured before the soundcloud widget was fully loaded
        if (this.soundCloudWidget) {
            for (const props of this.propsQueue) {
                if (props.paused) {
                    this.soundCloudWidget.pause();
                } else {
                    this.soundCloudWidget.play();
                }
                const volume = Math.min(Math.max(props.volume, 0), 100);
                this.soundCloudWidget.setVolume(volume);
            }
            this.propsQueue = [];
        }
    }

    render() {
        const src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${this.props.trackId}&auto_play=false`;
        return (
            <iframe ref={this.iframeRef} width="0" height="0" frameBorder="0" scrolling="no" allow="autoplay" src={src} onLoad={this.initSoundCloudWidget}></iframe>
        );
    }

}

export default SoundCloudPlayer;
