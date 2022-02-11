const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const comments = document.querySelectorAll(".video__comment");

const addComment = (text, id, owner) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;

  const column1 = document.createElement("div");
  const column2 = document.createElement("div");
  const column3 = document.createElement("div");
  newComment.appendChild(column1);
  newComment.appendChild(column2);
  newComment.appendChild(column3);

  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span1 = document.createElement("span");
  span1.innerText = text;
  const small = document.createElement("small");
  small.innerText = "commented by ";
  const a = document.createElement("a");
  a.href = `/users/${owner._id}`;
  a.innerText = owner.name;
  small.appendChild(a);

  const span2 = document.createElement("span");
  span2.innerText = "❌";

  column1.appendChild(icon);
  column1.appendChild(span1);
  column2.appendChild(small);

  column3.appendChild(span2);
  videoComments.prepend(newComment);

  const handleFakeCommentDelete = () => {
    newComment.remove();
  };
  span2.addEventListener("click", handleFakeCommentDelete);
};

if (form) {
  const textarea = form.querySelector("textarea");
  const fetchComment = async () => {
    const videoId = videoContainer.dataset.id;
    const text = textarea.value;

    if (!text.trim()) {
    } else {
      const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      const { status } = response;

      if (status === 201) {
        textarea.value = "";
        const { newCommentId, user } = await response.json();
        console.log(user);
        addComment(text, newCommentId, user);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await fetchComment();
  };

  const handleFocus = () => {
    const handleEnter = async (event) => {
      if (event.isComposing) {
        return;
      }
      if (event.code === "Enter") {
        await fetchComment();
      }
    };
    form.addEventListener("keydown", handleEnter);
  };

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("focusin", handleFocus);
}

comments.forEach((comment) => {
  const deleteBtn = comment.querySelector("div:last-child > span");
  const handleDelete = async () => {
    const { id } = comment.dataset;
    const response = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    const { status } = response;
    if (status === 200) {
      comment.remove();
    }
  };
  deleteBtn.addEventListener("click", handleDelete);
});
