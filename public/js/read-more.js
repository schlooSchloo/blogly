//// Listen for click on card and redirect user to the respective blog post
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => {
    const postID = card.getAttribute("data-json-id");
    window.location.href = `/read-blog?postID=${postID}`; //redirect user to /read-blog with respective blog post content generated
  });
});
