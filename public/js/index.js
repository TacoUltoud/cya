var CLIENT_ID = '506634394743-lfkonje6ojpeqjpfin97v5umupjon3ed.apps.googleusercontent.com';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES,
    ux_mode:"redirect",
    redirect_uri:"https://demo3.104di.clifflu.net/calendar"
    // redirect_uri:"http://localhost:8080/calendar"
  }).then(function () {
    // gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    location.href="https://demo3.104di.clifflu.net/calendar"
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
  gapi.auth2.getAuthInstance().disconnect();
  document.location.href = "/";
}

function renderButton() {
  gapi.signin2.render('authorize-button', {
    'width': 240,
    'height': 50,
    'theme': 'dark'
  });
}