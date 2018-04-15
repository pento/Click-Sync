function storageUpdated( changes, areaName ) {
	if ( areaName !== "sync" ) {
		return;
	}

	console.log( id, changes );
}

chrome.storage.onChanged.addListener( storageUpdated );
