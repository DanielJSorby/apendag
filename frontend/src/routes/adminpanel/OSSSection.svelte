<script lang="ts">
import { onMount } from 'svelte';

let { faqQuestions = $bindable() } = $props();

let faqSearch = $state('');
let isCreatingFAQ = $state(false);
let editingFAQ = $state<any | null>(null);
let draggedItem = $state<any | null>(null);

let newFAQ = $state({
    question: '',
    answer: ''
});

let filteredFAQ = $derived(
    faqQuestions.filter((faq: any) =>
        faq.question?.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(faqSearch.toLowerCase())
    )
);

async function createFAQ() {
    try {
        const response = await fetch('/api/admin/faq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFAQ)
        });
        
        if (response.ok) {
            newFAQ = { question: '', answer: '' };
            isCreatingFAQ = false;
            await loadFAQ();
        }
    } catch (error) {
        console.error('Error creating FAQ:', error);
    }
}

async function updateFAQ(faq: any) {
    try {
        const response = await fetch('/api/admin/faq', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(faq)
        });
        
        if (response.ok) {
            editingFAQ = null;
            await loadFAQ();
        }
    } catch (error) {
        console.error('Error updating FAQ:', error);
    }
}

async function deleteFAQ(id: number) {
    if (!confirm('Er du sikker på at du vil slette dette spørsmålet?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/faq', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        if (response.ok) {
            await loadFAQ();
        }
    } catch (error) {
        console.error('Error deleting FAQ:', error);
    }
}

async function loadFAQ() {
    try {
        const response = await fetch('/api/admin/faq');
        if (response.ok) {
            const data = await response.json();
            faqQuestions = data.questions || [];
        }
    } catch (error) {
        console.error('Error loading FAQ:', error);
    }
}

async function reorderFAQ() {
    try {
        const orders = faqQuestions.map((faq: any, index: number) => ({
            id: faq.id,
            display_order: index + 1
        }));
        
        const response = await fetch('/api/admin/faq', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders })
        });
        
        if (response.ok) {
            await loadFAQ();
        }
    } catch (error) {
        console.error('Error reordering FAQ:', error);
    }
}

function handleDragStart(faq: any) {
    draggedItem = faq;
}

function handleDragOver(event: DragEvent) {
    event.preventDefault();
}

function handleDrop(targetFAQ: any) {
    if (!draggedItem || draggedItem.id === targetFAQ.id) {
        draggedItem = null;
        return;
    }
    
    const draggedIndex = faqQuestions.findIndex((f: any) => f.id === draggedItem!.id);
    const targetIndex = faqQuestions.findIndex((f: any) => f.id === targetFAQ.id);
    
    const newQuestions = [...faqQuestions];
    const [removed] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, removed);
    
    faqQuestions = newQuestions;
    draggedItem = null;
    reorderFAQ();
}
</script>

<div class="section-header">
    <h2>FAQ Spørsmål</h2>
    <div class="actions">
        <input 
            type="text" 
            placeholder="Søk FAQ..." 
            bind:value={faqSearch}
            class="search-input"
        />
        <button onclick={() => isCreatingFAQ = !isCreatingFAQ} class="btn-primary">
            Nytt spørsmål
        </button>
    </div>
</div>

{#if isCreatingFAQ}
    <div class="create-form">
        <h3>Opprett nytt FAQ spørsmål</h3>
        <div class="form-grid">
            <textarea 
                placeholder="Spørsmål" 
                bind:value={newFAQ.question}
                rows="2"
                style="grid-column: 1 / -1;"
            ></textarea>
            <textarea 
                placeholder="Svar" 
                bind:value={newFAQ.answer}
                rows="4"
                style="grid-column: 1 / -1;"
            ></textarea>
        </div>
        <div class="form-actions">
            <button onclick={createFAQ} class="btn-success">
                Opprett
            </button>
            <button onclick={() => { isCreatingFAQ = false; newFAQ = { question: '', answer: '' }; }} class="btn-cancel">
                Avbryt
            </button>
        </div>
    </div>
{/if}

<div class="faq-list">
    {#each filteredFAQ as faq (faq.id)}
        <div 
            class="faq-item"
            role="button"
            tabindex="0"
            draggable="true"
            ondragstart={() => handleDragStart(faq)}
            ondragover={handleDragOver}
            ondrop={() => handleDrop(faq)}
        >
            {#if editingFAQ?.id === faq.id}
                <div class="faq-edit-form">
                    <textarea 
                        bind:value={editingFAQ.question}
                        placeholder="Spørsmål"
                        rows="2"
                    ></textarea>
                    <textarea 
                        bind:value={editingFAQ.answer}
                        placeholder="Svar"
                        rows="4"
                    ></textarea>
                    <div class="faq-actions">
                        <button onclick={() => updateFAQ(editingFAQ)} class="btn-small btn-success">
                            Lagre
                        </button>
                        <button onclick={() => editingFAQ = null} class="btn-small btn-cancel">
                            Avbryt
                        </button>
                    </div>
                </div>
            {:else}
                <div class="faq-content">
                    <div class="faq-drag-handle">☰</div>
                    <div class="faq-text">
                        <h3>{faq.question}</h3>
                        <p>{faq.answer}</p>
                    </div>
                    <div class="faq-actions">
                        <button onclick={() => { editingFAQ = {...faq}; }} class="btn-small btn-edit">
                            Rediger
                        </button>
                        <button onclick={() => deleteFAQ(faq.id)} class="btn-small btn-danger">
                            Slett
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
    }

    .section-header h2 {
        margin: 0;
        color: #333;
    }

    .actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .search-input {
        padding: 12px 20px;
        border: 2px solid #e8e8e8;
        border-radius: 25px;
        font-size: 0.95rem;
        min-width: 250px;
        transition: all 0.3s ease;
        background: white;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    .btn-primary {
        padding: 12px 24px;
        background: var(--color-pink);
        color: white;
        border: 2px solid var(--color-pink);
        border-radius: 25px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(217, 59, 96, 0.2);
    }

    .btn-primary:hover {
        background: white;
        color: var(--color-pink);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(217, 59, 96, 0.3);
    }

    .create-form {
        background: var(--color-grey);
        padding: 25px;
        border-radius: 15px;
        margin-bottom: 25px;
        border: 2px solid var(--color-pink-light);
        box-shadow: 0 2px 10px rgba(217, 59, 96, 0.05);
    }

    .create-form h3 {
        margin-top: 0;
        color: #333;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 15px;
    }

    .form-grid textarea {
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.95rem;
        font-family: inherit;
        resize: vertical;
        width: 100%;
        box-sizing: border-box;
    }

    .form-grid textarea:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    .form-actions {
        display: flex;
        gap: 10px;
    }

    .btn-success {
        padding: 12px 24px;
        background: var(--color-green);
        color: white;
        border: 2px solid var(--color-green);
        border-radius: 25px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(73, 116, 80, 0.2);
    }

    .btn-success:hover {
        background: white;
        color: var(--color-green);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(73, 116, 80, 0.3);
    }

    .btn-cancel {
        padding: 10px 20px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

    .btn-cancel:hover {
        background: #5a6268;
    }

    .faq-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .faq-item {
        background: white;
        border: 2px solid #f0f0f0;
        border-radius: 15px;
        padding: 20px;
        transition: all 0.3s ease;
        cursor: move;
    }

    .faq-item:hover {
        border-color: var(--color-pink);
        box-shadow: 0 4px 15px rgba(217, 59, 96, 0.1);
    }

    .faq-item[draggable="true"] {
        cursor: grab;
    }

    .faq-item[draggable="true"]:active {
        cursor: grabbing;
    }

    .faq-content {
        display: flex;
        gap: 15px;
        align-items: flex-start;
    }

    .faq-drag-handle {
        color: #ccc;
        font-size: 1.5rem;
        cursor: grab;
        padding: 5px;
        user-select: none;
    }

    .faq-text {
        flex: 1;
    }

    .faq-text h3 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 1.1rem;
    }

    .faq-text p {
        margin: 0;
        color: #666;
        line-height: 1.6;
    }

    .faq-edit-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .faq-edit-form textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.95rem;
        font-family: inherit;
        resize: vertical;
        box-sizing: border-box;
    }

    .faq-edit-form textarea:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: 0 0 0 3px rgba(217, 59, 96, 0.1);
    }

    .faq-actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .btn-small {
        padding: 8px 16px;
        border: 2px solid;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.3s ease;
        font-weight: 500;
    }

    .btn-edit {
        background: var(--color-orange);
        border-color: var(--color-orange);
        color: white;
        box-shadow: 0 2px 8px rgba(220, 137, 70, 0.2);
    }

    .btn-edit:hover {
        background: white;
        color: var(--color-orange);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 137, 70, 0.3);
    }

    .btn-danger {
        background: var(--color-pink);
        color: white;
        border: 2px solid var(--color-pink);
        border-radius: 25px;
        padding: 10px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(217, 59, 96, 0.2);
    }

    .btn-danger:hover {
        background: white;
        color: var(--color-pink);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(217, 59, 96, 0.3);
    }

    @media (max-width: 768px) {
        .section-header {
            flex-direction: column;
            align-items: stretch;
        }

        .actions {
            flex-direction: column;
        }

        .search-input {
            min-width: 100%;
        }

        .faq-content {
            flex-direction: column;
        }

        .faq-actions {
            width: 100%;
            justify-content: flex-end;
        }
    }
</style>
