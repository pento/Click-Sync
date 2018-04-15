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
			console.log( key, changes[ key ].newValue );
		}
	}
}

chrome.storage.onChanged.addListener( storageUpdated );
