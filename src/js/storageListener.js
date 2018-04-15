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
			} );
		}
	}
}

chrome.storage.onChanged.addListener( storageUpdated );
