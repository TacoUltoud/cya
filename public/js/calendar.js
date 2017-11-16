var curpos;
var map;
var markers = [];
var myMarker;
var temp;
var evt;
var myCurpos = [];
var path = []
var despos={lat:0,lng:0}
var zoomCenter;

var CLIENT_ID = '506634394743-lfkonje6ojpeqjpfin97v5umupjon3ed.apps.googleusercontent.com';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var signoutButton = document.getElementById('signout-button');
var loading = document.getElementById('loading')
var correct = document.getElementById('correct-button')
var zoom = document.getElementById('zoom-button')

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(function () {
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    listUpcomingEvents();
    signoutButton.onclick = handleSignoutClick;
  });
}

function updateSigninStatus(isSignedIn) {
  if(isSignedIn){
    signoutButton.style.display = "block"
    loading.style.display = "block"
  }
  else{
    // location.href="https://demo3.104di.clifflu.net"
    location.href="http://localhost:8080"
  }
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
  gapi.auth2.getAuthInstance().disconnect();
  document.location.href = "/";
}

function appendOne(ele,msg) {
  const tmp = document.getElementById(ele);
  if(typeof msg === "string") tmp.innerHTML = msg;
  else{
    tmp.innerHTML += "Upcoming Date</br>"
    for(let key in msg){
      tmp.innerHTML += key + ": " + msg[key] + "<br />"
    }
  }
}

function listUpcomingEvents() {
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 2,
    'orderBy': 'startTime'
  }).then(function(res) {
    document.getElementById("loading").style.display = "none"
    document.getElementById("loading2").style.display = "block"
    evt = res.result.items[0]
    if(evt && checkTime(evt.start.dateTime) < 0){
      evt = res.result.items[1]
    }
    var temp_attendees = "";
    if(evt.hasOwnProperty("attendees")){
      for(let i = 0;i < evt.attendees.length;i++){
        temp_attendees += (' '+evt.attendees[i].displayName);
      }
      var info = {
        summary: evt.summary,
        start: getDateTime(evt.start.dateTime),
        location: evt.location,
        attendees: temp_attendees,
      }
    }
    else{
      var info = {
        summary: evt.summary,
        start: getDateTime(evt.start.dateTime),
        location: evt.location,
        attendees: gapi.auth2.getAuthInstance().currentUser.Ab.w3.ig
      }
    }
    temp = {
      id: evt.id,
      location: evt.location,
      self: {
        myName: gapi.auth2.getAuthInstance().currentUser.Ab.w3.ig,
        myEmail: gapi.auth2.getAuthInstance().currentUser.Ab.w3.U3,
        myPhoto:gapi.auth2.getAuthInstance().currentUser.Ab.w3.Paa
      }
    }
    if(evt && checkTime(evt.start.dateTime) > 0){
      appendOne("myEvent",info)
      $.ajax({
        url: "/sendevent",
        type: "post",
        data: temp,
        success: function(result){
          console.log("1 event get")
        }
      })
    }
    else appendOne("myEvent",'No upcoming events found.');
    showMap()
  });
  updatecurpos();
}

function updatecurpos(){
  if (evt && checkTime(evt.start.dateTime) > 0) {
    navigator.geolocation.getCurrentPosition(function (position) {
      curpos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      myCurpos.push(curpos);
      // console.log(myCurpos)
      if(myCurpos.length === 5){
        var obj = {
          "position": Avg(myCurpos),
          "id": temp.id,
          "email": temp.self.myEmail
        }
        myCurpos.splice(0,2)  // shift twice
        $.post("/sendposition",obj,function(data, status){
          console.log("update current success");
        })
      }
    })
  }
}
setInterval(updatecurpos,5000)
var check = setInterval(showMap,5000)
function showMap(){
  if (evt && (checkTime(evt.start.dateTime) <= 1800000) && (checkTime(evt.start.dateTime) > 0)) {
    $.ajax({
      url: "/getDestination",
      type: "post",
      data:{"location":temp.location},
      success: function(result){
        despos.lat=result.position.lat
        despos.lng=result.position.lng
        initMap();
      }
    })
    clearInterval(check)
  }
  else{
    document.getElementById("loading2").style.display = "none"
    appendOne("map","No date within 30 minutes.</br>I can't show you friends' location.");
  }
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16
  });
  var image2 = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
  
  var destination = new google.maps.Marker({
    position: despos,
    map: map,
    icon:image2,
    label:"目的地",
    opacity: 0.5
  })
  map.setCenter(despos);
  document.getElementById('map').firstChild.style.display = "block"
  document.getElementById("showMap").style.display = "block"
  document.getElementById("loading2").style.display = "none"
  correct.style.display = 'block'
  zoom.style.display = 'block'
  countDown()
  getOtherPos();
  addMyMarker();
  setInterval(getOtherPos,10000);
  setInterval(addMyMarker,10000);
}
  
function addMyMarker(){
  if(myMarker) myMarker.setMap(null)
  myMarker = new google.maps.Marker({
    position: curpos,
    map: map,
    label:"我"
  })
}
function getDateTime(time) {
  var date = new Date(time);
  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;
  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;
  return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

function checkTime(st){
  var des = new Date(st).getTime()
  var now = Date.now()
  var diff = des - now
  return diff
}

function countDown(){
  var countDown = setInterval(() => {
    var des = new Date(evt.start.dateTime).getTime()
    var now = Date.now()
    var diff = des - now
    var hours = Math.floor(diff / (1000 * 60 * 60))
    var mins = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60))
    var secs = Math.floor(diff % (1000 * 60) / 1000)
    if(document.getElementById("countDown")){
      var ele = document.getElementById("countDown")
      ele.outerHTML = ""
      delete ele
    }
    var tmp = document.createElement("div")
    tmp.setAttribute("id","countDown")
    tmp.setAttribute("style","margin-top: 1%;text-align: center;position: relative;font-size:180px;opacity:0.5;color:red")
    tmp.innerText = ((hours < 10) ? "0" : "") + hours + ":" + ((mins < 10) ? "0" : "") + mins + ":" + ((secs < 10) ? "0" : "") + secs
    document.getElementById("map").appendChild(tmp)
    if(diff < 0){
      clearInterval(countDown)
      tmp.innerText = "Expired!"
      setTimeout(() => {location.reload()} , 300000)
    }
  } ,1000)
}
function showAndHide(){
  const tmp = document.getElementById("map").firstChild
  if(tmp.style.display === "block"){
    correct.style.display = "none"
    tmp.style.display = "none"
    zoom.style.display = "none"
  } 
  else {
    correct.style.display = "block"
    tmp.style.display = "block"
    zoom.style.display = "block"
  }
}
function Avg(pos){
  var avglat = 0
  var avglng = 0
  for(let i=0;i<pos.length;i++){
      avglat += pos[i].lat / pos.length
      avglng += pos[i].lng / pos.length
  }
  return {lat:avglat,lng:avglng}
}
function getOtherPos(){
  $.ajax({
    url: "/getdata",
    type: "post",
    data:{"event_id":temp.id,
          "email":temp.self.myEmail},
    success: function(result){
      // console.log(result[0].position[result[0].position.length - 1])
      removeMarkers("customMarker")
      addMarker(result,map)
      removeTrack(path)
      path = []
      for(let i = 0;i < result.length;i++){
        path.push(addTrack(result[i].position))
      }
      zoomCenter=allPosCenter(despos,result)
    }
  })
}
function CustomMarker(latlng, map, imageSrc, opacity) {
  this.latlng_ = latlng;
  this.imageSrc = imageSrc;
  this.opacity = opacity
  this.setMap(map);
}

CustomMarker.prototype = new google.maps.OverlayView();

CustomMarker.prototype.draw = function(){
  var div = this.div_;
  if(!div){
    div = this.div_ = document.createElement('div');
    div.className = "customMarker"

    var img = document.createElement("img");
    img.src = this.imageSrc;
    div.appendChild(img);

    var panes = this.getPanes();
    panes.overlayImage.appendChild(div);
  }
  var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
  if (point) {
    div.style.left = point.x + 'px';
    div.style.top = point.y + 'px';
  }
  div.style.opacity = this.opacity
};

function addMarker(arr,map){
  for(let i = 0;i < arr.length;i++){
    var displayCount = 5
    var show = (arr[i].position.length <= displayCount) ? arr[i].position.length : displayCount
    
    for(let j = arr[i].position.length - 1 ;j > arr[i].position.length - 1 - show; j--){
      new CustomMarker(new google.maps.LatLng(arr[i].position[j].lat,arr[i].position[j].lng),map,arr[i].photo,(show - arr[i].position.length + j + 1) / show)
    }
  }
}

function addTrack(arr){
  var res = []
  var displayCount = 5
  var show = (arr.length <= displayCount) ? arr.length : displayCount
  for(let i = arr.length - 1;i > arr.length - show;i--){
    var tmp = [arr[i - 1],arr[i]]
    var flightPath = new google.maps.Polyline({
      map: map,
      path: tmp,
      geodesic: true,
      strokeColor: '#ff0000',
      strokeOpacity: 1 - (arr.length - i - 1) / (show - 1),
      strokeWeight: 2
    });
    res.push(flightPath)
  }
  return res;
}

function removeMarkers(str){
  const tmp = document.getElementsByClassName(str)
  if(tmp.length){
    for(let i = tmp.length - 1;i >= 0;i--){
      tmp[i].remove()
    }
  }
}

function removeTrack(arr){
  if(arr.length){
    for(let i = 0;i < arr.length;i++){
      for(let j = 0;j < arr[i].length;j++){
        arr[i][j].setMap(null);
      }
    }
  }
}
function zoomToDes(){
  map.setCenter(despos);
  map.setZoom(16);
}
function allPosCenter(des,pos){
  var maxlat=des.lat;
  var maxlng=des.lng;
  var minlat=des.lat;
  var minlng=des.lng;
  for(let i=0;i<pos.length;i++){
    var tmp = pos[i].position.length
    if(pos[i].position[tmp-1].lat>maxlat){
      maxlat=pos[i].position[tmp-1].lat
    }
    if(pos[i].position[tmp-1].lat<minlat){
      minlat=pos[i].position[tmp-1].lat
    }
    if(pos[i].position[tmp-1].lng<minlng){
      minlng=pos[i].position[tmp-1].lng
    }
    if(pos[i].position[tmp-1].lng>maxlng){
      maxlng=pos[i].position[tmp-1].lng
    }
  }
  return {lat:(maxlat+minlat)/2,lng:(maxlng+minlng)/2}
}
function zoomToCenter(){
  console.log(despos)
  console.log(zoomCenter)
  map.setCenter(zoomCenter);
  map.setZoom(14)
}