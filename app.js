// Backend API
const API = "https://watchtube-backend.onrender.com/posts";

// Create user ID if not exists
if (!localStorage.getItem("userID")) {
    localStorage.setItem("userID", crypto.randomUUID());
}

let posts = [];

// Load posts from backend
async function loadPosts() {
    const res = await fetch(API);
    posts = await res.json();
    renderPosts();
}

// Save username locally (not on backend)
function setUsername() {
    const name = document.getElementById("usernameInput").value.trim();
    if (name.length < 1) return alert("Enter a username");

    localStorage.setItem("username", name);
    alert("Username updated");
}

// Create a new post (online)
async function createPost() {
    const text = document.getElementById("postText").value.trim();
    const video = document.getElementById("videoUpload").files[0];

    if (!text && !video) return alert("Write something or upload a video");

    let videoURL = null;
    if (video) {
        videoURL = URL.createObjectURL(video);
    }

    const post = {
        id: crypto.randomUUID(),
        userID: localStorage.getItem("userID"),
        username: localStorage.getItem("username") || "Anon",
        text,
        videoURL,
        likes: [],
        comments: []
    };

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post)
    });

    document.getElementById("postText").value = "";
    document.getElementById("videoUpload").value = "";

    loadPosts();
}

// Toggle like (online)
async function toggleLike(postID) {
    const userID = localStorage.getItem("userID");
    const post = posts.find(p => p.id === postID);

    let updatedLikes = post.likes.includes(userID)
        ? post.likes.filter(id => id !== userID)
        : [...post.likes, userID];

    await fetch(`${API}/${postID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: updatedLikes })
    });

    loadPosts();
}

// Add comment (online)
async function addComment(postID) {
    const input = document.getElementById("comment-" + postID);
    const text = input.value.trim();
    if (!text) return;

    const post = posts.find(p => p.id === postID);

    const updatedComments = [
        ...post.comments,
        {
            username: localStorage.getItem("username") || "Anon",
            text
        }
    ];

    await fetch(`${API}/${postID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: updatedComments })
    });

    loadPosts();
}

// Render posts
function renderPosts() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
            <strong>${post.username}</strong><br><br>
            ${post.text ? `<p>${post.text}</p>` : ""}
            ${post.videoURL ? `<video src="${post.videoURL}" controls width="300"></video>` : ""}
            <br><br>

            <span class="likeBtn" onclick="toggleLike('${post.id}')">
                ♥ ${post.likes.length}
            </span>

            <div class="commentBox">
                <input id="comment-${post.id}" placeholder="Write a comment">
                <button onclick="addComment('${post.id}')">Send</button>
            </div>

            <div class="comments">
                ${post.comments.map(c => `<p><b>${c.username}:</b> ${c.text}</p>`).join("")}
            </div>
        `;

        feed.appendChild(div);
    });
}

// Start the app
loadPosts();
