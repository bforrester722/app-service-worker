
// must use module resolution in webpack config and include app.config.js file in root
// of src folder (ie. resolve: {modules: [path.resolve(__dirname, 'src'), 'node_modules'],})
import {
	swReadyMessage, 
	swUpdateMessage
} from 'app.config.js';
import {
	message, 
	swToast
} from '@spriteful/utils/utils.js';

// Load and register pre-caching Service Worker
if ('serviceWorker' in navigator) {
	let needsRefresh;
	const promptUserOfNewVersion = async sw => {
		// show interactive toast
  	// const event = await swToast(swUpdateMessage);
  	// console.log(event)
  	// user hit refresh button not dismiss
  	// if (!event.detail.canceled) {
  		needsRefresh = true;
  		sw.postMessage('skip-waiting');
  	// }
	};
	// register sw, listen for new verions
  window.addEventListener('load', async () => {
  	// service-worker.js created by webpack
    const registration = await navigator.serviceWorker.register('service-worker.js');
    // new sw installed and now waiting to become activated
    if (registration.waiting) {
    	promptUserOfNewVersion(registration.waiting);
  		return;
  	}
  	// listen for new service workers
    registration.addEventListener('updatefound', () => {
	    // A wild service worker has appeared in registration.installing!
	    const newWorker = registration.installing;
	    newWorker.addEventListener('statechange', () => {	    	
		    // newWorker.state;
		    // "installing" - the install event has fired, but not yet complete
		    // "installed"  - install complete
		    // "activating" - the activate event has fired, but not yet complete
		    // "activated"  - fully active
		    // "redundant"  - discarded. Either failed install, or it's been
		    //                replaced by a newer version
	      if (newWorker.state === 'installed') {
	      	promptUserOfNewVersion(newWorker);
		    }
	    });
	  });
  });
  // if multiple tabs are open and new sw takes control of them
  // they will all be asked to reload to avoid multiple versions running simultaneously
	navigator.serviceWorker.addEventListener('message', event => {
		if (event.data === 'waiting-skipped') {
			window.location.reload();
		}
	});
	// This fires when the service worker controlling this page
	// changes, eg a new worker has skipped waiting and become
	// the new active worker.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
  	if (needsRefresh) {
  		// user was prompted to refresh, new sw has skipped waiting
  		// so reload page to get new data from new sw
  		window.location.reload();
  		return;
  	}
  	// this is the first time the app has been loaded so
  	// inform user of offline capability
	  message(swReadyMessage);
	});
}
