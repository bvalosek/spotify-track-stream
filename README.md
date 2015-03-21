# Spotify Track Stream

Create a readable object stream of a Spotify user's saved tracks ("My Music").

## Installation

```
$ npm install --save spotify-track-stream
```

## Overview

The point of this module is to provide a `Readable` stream that spits out Track
objects from the
[spotify-web-api-node](https://www.npmjs.com/package/spotify-web-api-node). It
will attempt to refresh the access token automatically when needed and will
page through all of the tracks via the `limit` and `offset` parameters of the
REST api until all tracks are fetched.

Make sure to have an understanding of the [Spotify Authentication
Flow](https://developer.spotify.com/web-api/authorization-guide/) to know how
to get and handle the various tokens and codes.

## Usage

```javascript
import SpotifyTrackStream from 'spotify-track-stream';
import SpotifyWebApi from 'spotify-web-api-node';
import through from 'through';

// Create an authenticated instance of the spotify API
let spotify = new SpotifyWebApi({
  clientId: '...',
  clientSecret: '...',
  accessToken: '...',
  refreshToken: '...'
});

let tracks = new SpotifyTrackStream(spotify);

tracks.pipe(through(track => console.log(track));
```

## Testing

Someday.

## License

MIT


