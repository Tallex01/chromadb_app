const searchForm = document.getElementById("searchForm");
const queryInput = document.getElementById("queryInput");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const resultTemplate = document.getElementById("resultTemplate");
const searchButton = document.getElementById("searchButton");

function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

function setStatus(message, variant = "neutral") {
	statusEl.textContent = message;
	statusEl.dataset.variant = variant;
}

function clearResults() {
	resultsEl.innerHTML = "";
}

function renderResults(results) {
	clearResults();

	if (!Array.isArray(results) || results.length === 0) {
		resultsEl.innerHTML = `<p class="empty">No matching chunks found.</p>`;
		return;
	}

	const fragment = document.createDocumentFragment();

	results.forEach((item, index) => {
		const clone = resultTemplate.content.cloneNode(true);
		const card = clone.querySelector(".result-card");
		const idChip = clone.querySelector(".id-chip");
		const scoreChip = clone.querySelector(".score-chip");
		const chunkText = clone.querySelector(".chunk-text");

		card.style.setProperty("--delay", `${index * 70}ms`);
		idChip.textContent = `Chunk #${item.id}`;
		const dist = Number(item.distance);
		scoreChip.textContent = Number.isFinite(dist)
			? `Distance: ${dist.toFixed(4)}`
			: "Distance: n/a";

		chunkText.innerHTML = escapeHtml(item.document ?? "");
		fragment.appendChild(clone);
	});

	resultsEl.appendChild(fragment);
}

async function fetchTopChunks(query) {
	const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
	return response.json();
}

searchForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const query = queryInput.value.trim();
	if (!query) {
		setStatus("Please type a query before searching.", "error");
		clearResults();
		return;
	}

	searchButton.disabled = true;
	searchButton.textContent = "Searching...";
	setStatus("Finding the top 5 most similar chunks...", "neutral");

	try {
		const data = await fetchTopChunks(query);
		renderResults(data);
		setStatus("Top 5 chunks loaded.", "success");
	} catch (error) {
		clearResults();
		resultsEl.innerHTML = `<p class="empty">Could not fetch results. Make sure the FastAPI app is running.</p>`;
		setStatus(error.message, "error");
	} finally {
		searchButton.disabled = false;
		searchButton.textContent = "Find Top 5";
	}
});
