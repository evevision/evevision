import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackward,
  faForward,
  faPlay,
  faPause,
  faRandom
} from "@fortawesome/free-solid-svg-icons";
import styles from "./jukebox.scss";
import { Panel } from "../../ui/Layout";
import { TextInput, SliderInput, Button } from "../../ui/Input";
import SoundCloudPlayer from "../../components/SoundCloudPlayer";
import playlist from "./playlist.json";
import JukeboxPlaylist from "./JukeboxPlayList";

function millisToMinutesAndSeconds(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
  return minutes + ":" + (parseInt(seconds) < 10 ? "0" : "") + seconds;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

interface JukeboxState {
  currentTrack: {
    title: string;
    number: number;
    duration: string;
    soundCloudTrackId: number;
  } | null;
  paused: boolean;
  volume: number;
  positionMilliseconds: number;
  shuffle: boolean;
}

class Jukebox extends React.PureComponent<{}, JukeboxState> {
  state: JukeboxState = {
    currentTrack: null,
    paused: true,
    volume: 50,
    positionMilliseconds: 0,
    shuffle: false
  };

  componentDidMount() {
    document.title = "Jukebox";
  }

  updateTrack = (track: {
    title: string;
    number: number;
    duration: string;
    soundCloudTrackId: number;
  }) => {
    this.setState({ ...this.state, currentTrack: track, paused: false });
  };

  updatePosition = (positionMilliseconds: number) => {
    this.setState({ ...this.state, positionMilliseconds });
  };

  updateVolume = (volume: number) => {
    this.setState({ ...this.state, volume });
  };

  play = () => {
    if (this.state.currentTrack) {
      this.setState({ ...this.state, paused: false });
    } else {
      this.nextTrack();
    }
  };

  pause = () => {
    this.setState({ ...this.state, paused: true });
  };

  nextTrack = () => {
    let nextTrackIndex = 0;
    if (this.state.shuffle) {
      nextTrackIndex = getRandomInt(0, playlist.tracks.length - 1);
    } else if (this.state.currentTrack) {
      const currentTrackIndex = playlist.tracks.findIndex(
        track =>
          track.soundCloudTrackId === this.state.currentTrack?.soundCloudTrackId
      );
      nextTrackIndex = (currentTrackIndex + 1) % playlist.tracks.length;
    }
    const nextTrack = playlist.tracks[nextTrackIndex];
    this.setState({ ...this.state, currentTrack: nextTrack, paused: false });
  };

  prevTrack = () => {
    let prevTrackIndex = 0;
    if (this.state.shuffle) {
      prevTrackIndex = getRandomInt(0, playlist.tracks.length - 1);
    } else if (this.state.currentTrack) {
      const currentTrackIndex = playlist.tracks.findIndex(
        track =>
          track.soundCloudTrackId === this.state.currentTrack?.soundCloudTrackId
      );
      prevTrackIndex =
        (currentTrackIndex - 1 + playlist.tracks.length) %
        playlist.tracks.length;
    }
    const nextTrack = playlist.tracks[prevTrackIndex];
    return this.setState({
      ...this.state,
      currentTrack: nextTrack,
      paused: false
    });
  };

  shuffle = () => {
    this.setState({ ...this.state, shuffle: !this.state.shuffle });
  };

  render() {
    return (
      <>
        {this.state.currentTrack && (
          <SoundCloudPlayer
            trackId={this.state.currentTrack.soundCloudTrackId}
            paused={this.state.paused}
            volume={this.state.volume}
            onPositionChange={this.updatePosition}
            onFinished={this.nextTrack}
          />
        )}
        <Panel>
          <TextInput
            value={
              this.state.currentTrack
                ? `${millisToMinutesAndSeconds(
                    this.state.positionMilliseconds
                  )} \t ${this.state.currentTrack.title}`
                : ""
            }
            readOnly
            style={{ width: "100%" }}
          ></TextInput>
          <div className={styles["eve-jukebox-button-list"]}>
            <div>
              <Button onClick={this.prevTrack}>
                <FontAwesomeIcon icon={faBackward} fixedWidth />
              </Button>
              {this.state.paused ? (
                <Button onClick={this.play}>
                  <FontAwesomeIcon icon={faPlay} fixedWidth />
                </Button>
              ) : (
                <Button onClick={this.pause}>
                  <FontAwesomeIcon icon={faPause} fixedWidth />
                </Button>
              )}
              <Button onClick={this.nextTrack}>
                <FontAwesomeIcon icon={faForward} fixedWidth />
              </Button>
              <Button onClick={this.shuffle}>
                <FontAwesomeIcon
                  icon={faRandom}
                  color={this.state.shuffle ? "#9df799" : undefined}
                  fixedWidth
                />
              </Button>
            </div>
            <div>
              <SliderInput
                min={0}
                max={100}
                value={this.state.volume}
                style={{ width: "75px" }}
                onChange={this.updateVolume}
              />
            </div>
          </div>
          <div
            className={`${styles["eve-jukebox-playlist-container"]} eve-scrollbar`}
          >
            <JukeboxPlaylist
              playList={playlist}
              currentTrack={this.state.currentTrack}
              onTrackClick={this.updateTrack}
            />
          </div>
        </Panel>
      </>
    );
  }
}
export default Jukebox;
