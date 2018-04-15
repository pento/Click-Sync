function storageUpdated( changes, areaName ) {
	if ( areaName !== "sync" ) {
		return;
	}

	var localKey = 'history-' + id;

	for ( var key in changes ) {
		if ( localKey === key ) {
			continue;
		}

		if ( key.startsWith( 'history-' ) ) {
			var lastSynced;
			var syncingId = key.replace( 'history-', '' );
			changes[ key ].newValue.forEach( function ( url )  {
				if ( ! url ) {
					return;
				}

				chrome.history.getVisits( { url: url }, function ( visits ) {
					if ( visits.length > 0 ) {
						return;
					}

					chrome.history.addUrl( { url: url } );
				} );

				lastSynced = url;
			} );

			chrome.storage.sync.get( 'devices', function( value ) {
				var devices = value.devices;
				if ( typeof devices !== 'object' ) {
					devices = {};
				}

				if ( ! devices[ id ] ) {
					devices[ id ] = {};
				}

				if ( ! devices[ id ].synced ) {
					devices[ id ].synced = {};
				}

				devices[ id ].synced[ syncingId ] = lastSynced;

				chrome.storage.sync.set( { devices: devices } );
			} );
		}

		if ( 'devices' === key ) {
			var syncedUrls = [];

			for ( var deviceId in changes[ key ].newValue ) {
				if ( deviceId === id ) {
					continue;
				}

				var syncedUrl = changes[ key ].newValue[ deviceId ].synced[ id ];
				if ( ! syncedUrl ) {
					continue;
				}

				syncedUrls.push( syncedUrl );
			}

			chrome.storage.sync.get( localKey, function( value ) {
				var history = value[ localKey ];
				if ( typeof history !== 'object' ) {
					return;
				}

				console.log( history );

				var syncedUrlLocations = syncedUrls.map( function( url ) {
					return history.indexOf( url );
				} );

				var oldestSyncedUrl = syncedUrlLocations.reduce( function( oldest, current ) {
					if ( -1 === oldest ) {
						return current;
					}

					if ( current > oldest ) {
						return oldest;
					}

					return current;
				}, -1 );

				if ( oldestSyncedUrl < 0 ) {
					return;
				}

				var unsyncedHistory = history.slice( oldestSyncedUrl );

				var data = {};
				data[ localKey ] = unsyncedHistory;

				chrome.storage.sync.set( data );
			} );
		}
	}
}

chrome.storage.onChanged.addListener( storageUpdated );
