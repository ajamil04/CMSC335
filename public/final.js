window.addEventListener("DOMContentLoaded", async() => {
    const response = await fetch("/songPreviews");
    const data = await response.json();

    const audio = new Audio(data.preview_url);
    audio.play();

    document.body.innerHTML += `<p>Now playing: <strong>${data.name}</strong> by ${data.artist}</p>`;
});