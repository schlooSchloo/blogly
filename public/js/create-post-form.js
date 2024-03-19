//// Change displayed file name and color on upload of image
const uploadButton = document.getElementById("imgSrc");
const fileText = document.getElementById("upload-img-text");

uploadButton.addEventListener("change", function () {
  fileText.textContent = this.files[0].name;
  fileText.style.color = "#000000";
});

//// Creating a New Section (on load and on 'New Section' button click)
function createNewSection() {
  //// Creates new Section from Template with updated IDs

  var newSection = sectionTemplate.cloneNode(true);

  // Alter fieldset attributes
  newSection.setAttribute("id", "section-" + sectionNum);

  // Alter Section Header
  newSection.querySelector("legend").textContent = "Section " + sectionNum;

  // Alter section title label and input attributes
  newSection
    .querySelectorAll("label")[0]
    .setAttribute("for", "sectionTitle_" + sectionNum);
  newSection
    .querySelector("#sectionTitle_Num")
    .setAttribute("id", "sectionTitle_" + sectionNum);

  // Alter delete button attributes (id and data-json-id)
  // newSection
  //   .querySelector("#delete-section-num")
  //   .setAttribute("data-json-id", sectionNum);
  newSection
    .querySelector("#delete-section-num")
    .setAttribute("id", "delete-section-" + sectionNum);

  // Alter section content label and input attributes
  newSection
    .querySelectorAll("label")[1]
    .setAttribute("for", "sectionContent_" + sectionNum);
  newSection
    .querySelector("#sectionContent_Num")
    .setAttribute("id", "sectionContent_" + sectionNum);

  // Make Section Content a required input
  newSection.querySelector("textarea").required = true;

  // Append to the bottom of postBody
  postBody.append(newSection);

  // Change visibility of delete buttons based on number of active Sections
  deleteButtonVisible();

  //Add event listeners to all Delete Buttons
  listenForDelete();

  sectionNum++;

  return newSection;
}

//// Delete button is only visible when there's more than one Section active
function deleteButtonVisible() {
  console.log("deleteButtonVisible called");
  const deleteButton = document.querySelectorAll(".delete-section");
  console.log("Number of delete buttons: ", deleteButton.length);
  if (deleteButton.length < 3) {
    for (i = 0; i < deleteButton.length; i++) {
      deleteButton[i].classList.add("hide");
    }
  } else {
    for (i = 0; i < deleteButton.length; i++) {
      deleteButton[i].classList.remove("hide");
    }
  }
}

function listenForDelete() {
  //// Add Event Listeners to Delete Buttons to detect when button is clicked
  document.querySelectorAll(".delete-section").forEach((button) => {
    button.addEventListener("click", function () {
      console.log("Delete Button Clicked...");
      // console.log(this.id.slice(7));
      deleteSection(this.id.slice(7));
    });
  });
}

function deleteSection(sectionID) {
  //// Delete section when respective Delete button is clicked
  console.log(sectionID);
  document.getElementById(sectionID).remove();
  deleteButtonVisible();

  //Only reduce sectionNum if the last Section is getting deleted. Otherwise have to update section numbers and ids for all sections
  if (sectionID.slice(8) == sectionNum - 1) {
    sectionNum--;
  }
}

var sectionNum = document.getElementsByTagName("fieldset").length;
const postBody = document.getElementById("post-body");
const addSection = document.querySelector(".add-section");
const sectionTemplate = document.getElementById("section-template");

// On load, add event listeners to delete buttons (for edit post)
listenForDelete();

//// Create first section on page load (only if new post - i.e. only section loaded is the hidden template)
if (sectionNum == 1) {
  createNewSection();
}

//// Add new section fieldset at the end of 'post-body' <div> when 'Add New Section' button is clicked
addSection.addEventListener("click", function () {
  console.log("Add New Section Button clicked. Creating new Section...");
  // const newSection = createNewSection();

  // Append to the bottom of postBody
  postBody.appendChild(document.createElement("br"));
  // Create and append a New Section
  createNewSection();
});

//// On click of 'Discard' button, don't submit form and redirect user to '/view-all'

document.getElementById("discard-btn").addEventListener("click", function () {
  window.location.href = "/view-all";
});
