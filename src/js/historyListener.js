var id;

chrome.storage.local.get( 'id', function ( result ) {
	if ( result.id ) {
		id = result.id;
	} else {
		createLocalId();
	}
} );


function createLocalId() {
	function getRandomSymbol( symbol ) {
        var array;

        if ( symbol === 'y' ) {
            array = [ '8', '9', 'a', 'b' ];
            return array[ Math.floor( Math.random() * array.length ) ];
        }

        array = new Uint8Array( 1 );
        window.crypto.getRandomValues( array );
        return ( array[ 0 ] % 16 ).toString( 16 );
    }

	id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, getRandomSymbol );

	chrome.storage.local.set( { id: id } );
}

function historyVisited( visit ) {
	if ( visit.vistedCount > 1 ) {
		return;
	}

	chrome.storage.sync.get( 'history-' + id, function ( result ) {
		var history = result[ 'history-' + id ];
		if( typeof history !== 'object' ) {
			history = [];
		}

		history.push( visit.url );

		var data = {};
		data[ 'history-' + id ] = history;

		chrome.storage.sync.set( data );
	} );
}

chrome.history.onVisited.addListener( historyVisited );
