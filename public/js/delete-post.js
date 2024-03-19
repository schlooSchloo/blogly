//// On click of 'delete post' button, send delete request to delete blog post. On successful deletion, redirect user to /view-all resource
const deleteButton = document.querySelector(".delete-post");
deleteButton.addEventListener("click", (button) => {
  const postID = deleteButton.getAttribute("data-json-id");

  fetch(`/delete-post?postID=${postID}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Deleted", data);
      alert(
        "Blog Post deleted successfully! \n \nRedirecting you back to the Read page"
      );
      window.location.href = "/view-all"; //redirects user to view all blogs on successful deletion of resource
    })
    .catch((error) => {
      console.error("There was a problem with the delete request", error);
    });
});

//// On click of 'Edit Post' button, make request to /edit-post route, with postID parameter
const editButton = document.querySelector(".edit-post");

editButton.addEventListener("click", () => {
  const postID = editButton.getAttribute("data-json-id");
  window.location.href = `/edit-post?postID=${postID}`;
});
