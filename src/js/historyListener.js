function historyVisited( result ) {
	if ( result.vistedCount > 1 ) {
		return;
	}
}

chrome.history.onVisited.addListener( historyVisited );
