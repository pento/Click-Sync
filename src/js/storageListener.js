function storageUpdated( changes, areaName ) {
	if ( areaName !== "sync" ) {
		return;
	}

	var localHistoryKey = 'history-' + id;
	var localDeviceKey = 'device-' + id;

	var syncedUrls = [];

	for ( var key in changes ) {
		if ( localHistoryKey === key ) {
			continue;
		}

		if ( localDeviceKey === key ) {
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

			chrome.storage.sync.get( localDeviceKey, function( value ) {
				var device = value[ localDeviceKey ];
				if ( typeof device !== 'object' ) {
					device = {};
				}

				if ( typeof device.synced !== 'object' ) {
					device.synced = {};
				}

				device.synced[ syncingId ] = lastSynced;

				var data = {};
				data[ localDeviceKey ] = device;

				chrome.storage.sync.set( data );
			} );
		}

		if ( key.startsWith( 'device-' ) ) {
			var deviceId = key.replace( 'device-', '' );

			var syncedUrl = changes[ key ].newValue.synced[ id ];
			if ( syncedUrl ) {
				syncedUrls.push( syncedUrl );
			}
		}
	}

	if ( syncedUrls.length ) {
		chrome.storage.sync.get( localHistoryKey, function( value ) {
			var history = value[ localHistoryKey ];
			if ( typeof history !== 'object' ) {
				return;
			}

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
			data[ localHistoryKey ] = unsyncedHistory;

			chrome.storage.sync.set( data );
		} );
	}
}

chrome.storage.onChanged.addListener( storageUpdated );
