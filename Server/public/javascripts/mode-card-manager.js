var modeElements = document.querySelectorAll(".mode-options");


// Set the correct mode options when the page loads.
onModeChange(document.querySelector("#mode").value);


/**
 * Sets the options for the mode card corresponding to the selected mode.
 * @param {string} mode - The mode to set the options for.
 */
function onModeChange(mode){

  let activeElement;

  for(let i = 0; i < modeElements.length; i++){
    if(modeElements[i].classList.contains(mode)){
      activeElement = modeElements[i];
      break;
    }
  }

  modeElements.forEach((element) => {
    element.classList.add("inactive");
  });

  activeElement.classList.remove("inactive");
}