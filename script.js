// =========================
// Local Storage Keys
// =========================
const USERS_KEY = "blog_users";
const POSTS_KEY = "blog_posts";
const CURRENT_USER_KEY = "blog_current_user";

// =========================
// DOM Elements
// =========================
const authSection = document.getElementById("authSection");
const blogSection = document.getElementById("blogSection");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const postForm = document.getElementById("postForm");

const postsContainer = document.getElementById("postsContainer");

const profileSection = document.getElementById("profileSection");
const userSection = document.getElementById("userSection");
const profileName = document.getElementById("profileName");
const logoutBtn = document.getElementById("logoutBtn");

const toast = document.getElementById("toast");

// =========================
// Utility Functions
// =========================
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}

function getPosts() {
    return JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
}

function savePosts(posts) {
    localStorage.setItem(
        POSTS_KEY,
        JSON.stringify(posts)
    );
}

function getCurrentUser() {
    return JSON.parse(
        localStorage.getItem(CURRENT_USER_KEY)
    );
}

function saveCurrentUser(user) {
    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(user)
    );
}

function removeCurrentUser() {
    localStorage.removeItem(
        CURRENT_USER_KEY
    );
}

function generateId() {
    return (
        Date.now().toString() +
        Math.floor(Math.random() * 1000)
    );
}

function formatDate(date) {
    return new Date(date).toLocaleString();
}

// =========================
// Authentication
// =========================

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username =
        document
            .getElementById("registerUsername")
            .value
            .trim();

    const password =
        document
            .getElementById("registerPassword")
            .value
            .trim();

    if (username.length < 3) {
        showToast(
            "Username must be at least 3 characters"
        );
        return;
    }

    if (password.length < 4) {
        showToast(
            "Password must be at least 4 characters"
        );
        return;
    }

    const users = getUsers();

    const exists = users.find(
        user => user.username === username
    );

    if (exists) {
        showToast("Username already exists");
        return;
    }

    users.push({
        id: generateId(),
        username,
        password
    });

    saveUsers(users);

    registerForm.reset();

    showToast(
        "Registration successful! Login now."
    );
});

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username =
        document
            .getElementById("loginUsername")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value
            .trim();

    const users = getUsers();

    const user = users.find(
        u =>
            u.username === username &&
            u.password === password
    );

    if (!user) {
        showToast(
            "Invalid username or password"
        );
        return;
    }

    saveCurrentUser(user);

    loginForm.reset();

    showToast("Login successful");

    updateUI();
});

logoutBtn.addEventListener("click", () => {
    removeCurrentUser();

    showToast("Logged out");

    updateUI();
});

// =========================
// UI Update
// =========================

function updateUI() {
    const user = getCurrentUser();

    if (user) {
        authSection.classList.add("hidden");
        blogSection.classList.remove("hidden");

        profileSection.classList.remove("hidden");
        userSection.classList.add("hidden");

        profileName.textContent =
            `👋 ${user.username}`;

        renderPosts();
    } else {
        authSection.classList.remove("hidden");
        blogSection.classList.add("hidden");

        profileSection.classList.add("hidden");
        userSection.classList.remove("hidden");
    }
}

// =========================
// Create Post
// =========================

postForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title =
        document
            .getElementById("postTitle")
            .value
            .trim();

    const content =
        document
            .getElementById("postContent")
            .value
            .trim();

    if (!title || !content) {
        showToast(
            "Please fill all fields"
        );
        return;
    }

    const currentUser =
        getCurrentUser();

    const posts = getPosts();

    posts.unshift({
        id: generateId(),
        title,
        content,
        author:
            currentUser.username,
        authorId:
            currentUser.id,
        createdAt:
            new Date().toISOString(),
        comments: []
    });

    savePosts(posts);

    postForm.reset();

    renderPosts();

    showToast(
        "Post published successfully"
    );
});

// =========================
// Render Posts
// =========================

function renderPosts() {
    const posts = getPosts();

    const currentUser =
        getCurrentUser();

    postsContainer.innerHTML = "";

    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="glass post-card">
                <h3>No Posts Yet</h3>
                <p>Create your first blog post.</p>
            </div>
        `;
        return;
    }

    posts.forEach(post => {

        const canEdit =
            currentUser &&
            post.authorId === currentUser.id;

        const postElement =
            document.createElement("div");

        postElement.className =
            "glass post-card";

        postElement.innerHTML = `
            <div class="post-header">
                <div>
                    <h2 class="post-title">
                        ${post.title}
                    </h2>

                    <div class="meta">
                        By ${post.author}
                        •
                        ${formatDate(
                            post.createdAt
                        )}
                    </div>
                </div>
            </div>

            <div class="post-content">
                ${post.content}
            </div>

            ${
                canEdit
                    ? `
                <div class="actions">
                    <button
                        class="btn edit-btn"
                        onclick="editPost('${post.id}')">
                        Edit
                    </button>

                    <button
                        class="btn delete-btn"
                        onclick="deletePost('${post.id}')">
                        Delete
                    </button>
                </div>
            `
                    : ""
            }

            <div class="comment-section">

                <h3>
                    Comments
                    (${post.comments.length})
                </h3>

                <div>
                    ${renderComments(
                        post.comments
                    )}
                </div>

                <form
                    class="comment-form"
                    onsubmit="addComment(event,'${post.id}')">

                    <input
                        type="text"
                        id="comment-${post.id}"
                        placeholder="Write a comment..."
                        required
                    >

                    <button
                        type="submit"
                        class="btn gradient-btn">
                        Add Comment
                    </button>

                </form>

            </div>
        `;

        postsContainer.appendChild(
            postElement
        );
    });
}

// =========================
// Comments Render
// =========================

function renderComments(comments) {

    if (comments.length === 0) {
        return `
            <p>
                No comments yet.
            </p>
        `;
    }

    return comments
        .map(comment => {

            return `
                <div class="comment">

                    <div class="comment-meta">
                        ${comment.author}
                        •
                        ${formatDate(
                            comment.date
                        )}
                    </div>

                    <div>
                        ${comment.text}
                    </div>

                </div>
            `;
        })
        .join("");
}

// =========================
// Add Comment
// =========================

function addComment(event, postId) {

    event.preventDefault();

    const input =
        document.getElementById(
            `comment-${postId}`
        );

    const text =
        input.value.trim();

    if (!text) {
        showToast(
            "Comment cannot be empty"
        );
        return;
    }

    const user =
        getCurrentUser();

    const posts =
        getPosts();

    const post =
        posts.find(
            p => p.id === postId
        );

    if (!post) return;

    post.comments.push({
        id: generateId(),
        author:
            user.username,
        text,
        date:
            new Date().toISOString()
    });

    savePosts(posts);

    renderPosts();

    showToast(
        "Comment added"
    );
}

// =========================
// Delete Post
// =========================

function deletePost(postId) {

    const confirmDelete =
        confirm(
            "Delete this post?"
        );

    if (!confirmDelete) return;

    let posts =
        getPosts();

    posts =
        posts.filter(
            post => post.id !== postId
        );

    savePosts(posts);

    renderPosts();

    showToast(
        "Post deleted"
    );
}

// =========================
// Edit Post
// =========================

function editPost(postId) {

    const posts =
        getPosts();

    const post =
        posts.find(
            p => p.id === postId
        );

    if (!post) return;

    const newTitle =
        prompt(
            "Edit title:",
            post.title
        );

    if (
        newTitle === null
    ) return;

    const newContent =
        prompt(
            "Edit content:",
            post.content
        );

    if (
        newContent === null
    ) return;

    post.title =
        newTitle.trim();

    post.content =
        newContent.trim();

    savePosts(posts);

    renderPosts();

    showToast(
        "Post updated"
    );
}

// =========================
// Initialize
// =========================

updateUI();