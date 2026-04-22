async function loadDocuments() {
    try {
        const response = await fetch('/documents');
        const documents = await response.json();
        
        const container = document.getElementById('documents-container');
        container.innerHTML = '';
        
        documents.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'document-card';
            card.innerHTML = `
                <div class="document-id">${doc.id}</div>
                <div class="document-text">${doc.document}</div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading documents:', error);
        const container = document.getElementById('documents-container');
        container.innerHTML = '<p class="error">Failed to load documents</p>';
    }
}

// Load documents when the page loads
document.addEventListener('DOMContentLoaded', loadDocuments);
