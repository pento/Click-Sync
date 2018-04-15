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
		} else {
			console.log( key, changes[ key ].newValue );
		}
	}
}

chrome.storage.onChanged.addListener( storageUpdated );
