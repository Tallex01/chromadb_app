function renderCards(container, documents, showDistance = false) {
    container.innerHTML = '';

    documents.forEach((doc, index) => {
        const card = document.createElement('article');
        card.className = 'document-card';

        const distanceMarkup = showDistance
            ? `<div class="document-distance">Distance: ${Number(doc.distance).toFixed(4)}</div>`
            : '';

        card.innerHTML = `
            <div class="card-header">
                <div class="document-id">${doc.id}</div>
                ${showDistance ? `<div class="result-rank">#${index + 1}</div>` : ''}
            </div>
            <div class="document-text">${doc.document}</div>
            ${distanceMarkup}
        `;

        container.appendChild(card);
    });
}

async function loadDocuments() {
    try {
        const response = await fetch('/documents');
        const documents = await response.json();

        const container = document.getElementById('documents-container');

        renderCards(container, documents);
    } catch (error) {
        console.error('Error loading documents:', error);
        const container = document.getElementById('documents-container');
        container.innerHTML = '<p class="error">Failed to load documents</p>';
    }
}

async function handleSearch(event) {
    event.preventDefault();

    const queryInput = document.getElementById('query-input');
    const searchResults = document.getElementById('search-results');
    const searchStatus = document.getElementById('search-status');
    const query = queryInput.value.trim();

    if (!query) {
        searchStatus.textContent = 'Enter a query to see the top 5 similar documents.';
        searchResults.classList.add('empty-state');
        searchResults.innerHTML = '<p class="empty-message">No search results yet.</p>';
        return;
    }

    searchStatus.textContent = `Searching for "${query}"...`;

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`Search failed with status ${response.status}`);
        }

        const results = await response.json();

        if (!results.length) {
            searchStatus.textContent = `No matches found for "${query}".`;
            searchResults.classList.add('empty-state');
            searchResults.innerHTML = '<p class="empty-message">No matching documents found.</p>';
            return;
        }

        searchResults.classList.remove('empty-state');
        renderCards(searchResults, results, true);
        searchStatus.textContent = `Showing the top ${results.length} matches for "${query}".`;
    } catch (error) {
        console.error('Error searching documents:', error);
        searchStatus.textContent = 'Search failed. Try again.';
        searchResults.classList.add('empty-state');
        searchResults.innerHTML = '<p class="error">Failed to load search results</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-form').addEventListener('submit', handleSearch);
    loadDocuments();
});
