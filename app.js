// Create user ID if not exists
if (!localStorage.getItem("userID")) {
    localStorage.setItem("userID", crypto.randomUUID());
}

let posts = JSON.parse(localStorage.getItem("posts") || "[]");

function setUsername() {
    const name = document.getElementById("usernameInput").value.trim();
    if (name.length < 1) return alert("Enter a username");

    localStorage.setItem("username", name);
    alert("Username updated");
}

function createPost() {
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

    posts.unshift(post);
    localStorage.setItem("posts", JSON.stringify(posts));

    document.getElementById("postText").value = "";
    document.getElementById("videoUpload").value = "";

    renderPosts();
}

function toggleLike(postID) {
    const userID = localStorage.getItem("userID");

    posts = posts.map(p => {
        if (p.id === postID) {
            if (p.likes.includes(userID)) {
                p.likes = p.likes.filter(id => id !== userID);
            } else {
                p.likes.push(userID);
            }
        }
        return p;
    });

    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}

function addComment(postID) {
    const input = document.getElementById("comment-" + postID);
    const text = input.value.trim();
    if (!text) return;

    posts = posts.map(p => {
        if (p.id === postID) {
            p.comments.push({
                username: localStorage.getItem("username") || "Anon",
                text
            });
        }
        return p;
    });

    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}

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

renderPosts();