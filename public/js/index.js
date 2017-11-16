var CLIENT_ID = '506634394743-lfkonje6ojpeqjpfin97v5umupjon3ed.apps.googleusercontent.com';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById('authorize-button');
var info = document.getElementById('info')

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES,
    ux_mode:"redirect",
    // redirect_uri:"https://demo3.104di.clifflu.net/calendar"
    redirect_uri:"http://localhost:8080/calendar"
  }).then(function () {
    // gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    info.style.display = 'none'
    // location.href="https://demo3.104di.clifflu.net/calendar"
    location.href="http://localhost:8080/calendar"
  } else {
    authorizeButton.style.display = 'block';
    info.style.display = 'block'    
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function renderButton() {
  gapi.signin2.render('authorize-button', {
    'width': 240,
    'height': 50,
    'theme': 'dark'
  });
}