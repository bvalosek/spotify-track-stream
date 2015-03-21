import {Readable} from 'stream';
import debug from 'debug';
import SpotifyWebApi from 'spotify-web-api-node';

debug = debug('SpotifyTrackStream');

// How many tracks to get per request (max 50 from API)
const trackLimit = 50;

// Response from spotify API when we need to refresh token
const expiredTokenMsg = 'The access token expired';

/**
 * A readable object stream of spotify tracks saved to a user profile
 */
export default class SpotifyTrackStream extends Readable
{
  constructor(spotify: SpotifyWebApi)
  {
    super({ objectMode: true });

    this._spotify = spotify;

    this._loading = false;
    this._done = false;
    this._offset = 0;
  }

  /**
   * Stream read implementation
   */
  async _read(): Promise<void>
  {
    if (this._loading || this._done) {
      return;
    }

    try {
      await this._fetchTracks();
    }
    catch (err) {

      // If our token has expired, time to request a refresh on it
      if (err && err.message === expiredTokenMsg) {
        await this._refresh();
        await this._fetchTracks();
        return;
      }

      this._done = true;
      debug('error fetching tracks: %s', err);
      this.emit('error', err);
    }
  }

  /**
   * Actually pull tracks from spotify
   */
  async _fetchTracks(): Promise<void>
  {
    debug('fetching from offset %d', this._offset);

    // Guard against too many fetches
    this._loading = true;

    let data = await this._spotify.getMySavedTracks({
      offset: this._offset,
      limit: trackLimit
    });

    // Immediately mark as done to allow streaming to continue on nextTick
    this._loading = false;

    let tracks = data.body.items;

    debug('recieved %d tracks', tracks.length);

    // We're done if we got back less than the limit
    if (tracks.length < trackLimit) {
      this._done = true;
    }
    else {
      this._offset += trackLimit;
    }

    // Emit each track as an object in teh stream
    for (let track of tracks) {
      this.push(track);
    }

    // Signal we're done by pushing null if we are out of tracks
    if (this._done) {
      this.push(null);
    }
  }

  /**
   * Use refresh token to get a newer access token
   */
  async _refresh(): Promise<void>
  {
    debug('refreshing access token');
    let data = await this._spotify.refreshAccessToken();
    this._spotify.setAccessToken(data.body.access_token);
  }

}
