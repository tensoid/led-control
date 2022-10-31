function deleteProfile(){
  let result = window.confirm("Are you sure you want to delete this profile?");
  if(!result) return;

  let profileName = document.querySelector("select#profile").value;

  API.profile({
    profileName,
    action: "delete"
  }, (result) => {
    result = JSON.parse(result);
    if(result.error) alert(result.error);
    else location.reload();
  });
}


function newProfile(){
  
  let name = window.prompt("Profile Name","");
  if(!name) return;

  API.profile({
    clients: [],
    profileName: name,
    action: "create"
  }, (result) => {
    result = JSON.parse(result);
    if(result.error) alert(result.error);
    else location.reload();
  });
}



function setProfile(){

  let profileName = document.querySelector("select#profile").value;

  API.profile({
    profileName,
    action: "set"
  }, (result) => {
    result = JSON.parse(result);
    if(result.error) alert(result.error);
    else location.reload();
  });
}
