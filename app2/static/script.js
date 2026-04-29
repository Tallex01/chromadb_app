const form = document.getElementById("chunk-form");
const textInput = document.getElementById("text");
const chunkSizeInput = document.getElementById("chunk-size");
const chunkOverlapInput = document.getElementById("chunk-overlap");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const submitBtn = document.getElementById("submit-btn");

function setStatus(message, isError = false) {
	statusEl.textContent = message;
	statusEl.classList.toggle("error", isError);
}

function renderResults(items) {
	if (!Array.isArray(items) || items.length === 0) {
		resultsEl.classList.add("empty");
		resultsEl.innerHTML = "No chunks returned.";
		return;
	}

	const chunksHtml = items
		.map((item, idx) => {
			const chunkText = item.chunk ?? item.Chunk ?? "";
			const length = item.len ?? item.Length ?? chunkText.length;

			return `
				<article class="chunk-card">
					<header>
						<h3>Chunk ${idx + 1}</h3>
						<span>Length: ${length}</span>
					</header>
					<pre>${chunkText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
				</article>
			`;
		})
		.join("");

	resultsEl.classList.remove("empty");
	resultsEl.innerHTML = chunksHtml;
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const payload = {
		text: textInput.value,
		chunk_size: Number(chunkSizeInput.value),
		chunk_overlap: Number(chunkOverlapInput.value)
	};

	submitBtn.disabled = true;
	setStatus("Chunking text...");

	try {
		const response = await fetch("/chunk", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});

		const data = await response.json();

		if (!response.ok) {
			const message = data?.detail || "Chunk request failed.";
			throw new Error(message);
		}

		renderResults(data);
		setStatus(`Generated ${data.length} chunk(s).`);
	} catch (error) {
		setStatus(error.message || "Something went wrong.", true);
		renderResults([]);
	} finally {
		submitBtn.disabled = false;
	}
});
