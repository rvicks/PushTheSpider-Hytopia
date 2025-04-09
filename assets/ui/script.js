// Log to confirm script is loaded (check browser dev console)
console.log('Hytopia UI Script Loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Hytopia UI Event Listener Initialized');

  const interactionPrompt = document.getElementById('interaction-prompt');
  const crosshairContainer = document.getElementById('crosshair-container');
  const notebook = document.getElementById('notebook');
  const clueList = document.getElementById('clue-list');
  const closeNotebookBtn = document.getElementById('close-notebook');
  const caseSolved = document.getElementById('case-solved');
  const continueBtn = document.getElementById('continue-btn');
  const mobileControls = document.getElementById('mobile-controls');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');

  let currentPageIndex = 0;
  const entriesPerPage = 5;
  let audioContextResumed = false;

  // Ensure mobile controls are hidden on desktop (not touch devices)
  if (mobileControls && !('ontouchstart' in window)) {
    mobileControls.style.display = 'none';
  }

  // Hide notebook at startup - VERY IMPORTANT
  if (notebook) {
    notebook.style.display = 'none';
    console.log('Notebook hidden at startup');
  }

  // Check if elements exist
  if (!interactionPrompt) {
    console.error('Interaction prompt element not found!');
  }
  if (!crosshairContainer) {
    console.error('Crosshair container element not found!');
  }
  if (!notebook) {
    console.error('Notebook element not found!');
  }
  if (!clueList) {
    console.error('Clue list element not found!');
  }

  // Set up event listeners for UI buttons
  if (closeNotebookBtn) {
    closeNotebookBtn.addEventListener('click', () => {
      notebook.style.display = 'none';
      console.log('Notebook closed via button');
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      caseSolved.style.display = 'none';
    });
  }

  // Make these globally accessible for the notebook toggle button
  window.currentPageIndex = currentPageIndex;
  window.notebookEntries = [];

  // --- Notebook Page Navigation Logic ---
  function renderNotebookPage(pageIndex) {
    if (!notebook || !clueList) {
      console.error('renderNotebookPage: Notebook or ClueList element not found!');
      return;
    }

    // Log input and state
    console.log(`renderNotebookPage called for pageIndex: ${pageIndex}. Total entries: ${window.notebookEntries.length}`);

    clueList.innerHTML = ''; // Clear previous entries
    const startIndex = pageIndex * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const pageEntries = window.notebookEntries.slice(startIndex, endIndex);

    console.log(`Rendering entries from index ${startIndex} to ${endIndex}. Entries on this page: ${pageEntries.length}`);

    if (pageEntries.length > 0) {
      pageEntries.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = entry;
        clueList.appendChild(li);
        console.log(`  - Appended entry ${startIndex + index}: ${entry}`);
      });
    } else if (pageIndex === 0 && window.notebookEntries.length === 0) {
      // Special case for completely empty notebook
      const emptyLi = document.createElement('li');
      emptyLi.className = 'empty-note';
      emptyLi.textContent = 'No clues recorded yet.';
      clueList.appendChild(emptyLi);
      console.log('  - Rendered empty note placeholder.');
    } else {
       // Handle case where page is out of bounds but notebook isn't empty
       const emptyLi = document.createElement('li');
       emptyLi.className = 'empty-note';
       emptyLi.textContent = '-'; // Placeholder for blank page beyond entries
       clueList.appendChild(emptyLi);
       console.log('  - Rendered blank page placeholder.');
    }

    const leftPageNum = document.querySelector('.left-page .page-number');
    const rightPageNum = document.querySelector('.right-page .page-number');
    if (leftPageNum) leftPageNum.textContent = (pageIndex * 2) + 1;
    if (rightPageNum) rightPageNum.textContent = (pageIndex * 2) + 2;

    if (prevPageBtn) prevPageBtn.disabled = pageIndex <= 0;
    if (nextPageBtn) nextPageBtn.disabled = endIndex >= window.notebookEntries.length;
  }

  // Make function globally accessible for the notebook toggle button
  window.renderNotebookPage = renderNotebookPage;

  function changePage(direction) {
    const maxPageIndex = Math.ceil(window.notebookEntries.length / entriesPerPage) - 1;
    let newPageIndex = currentPageIndex + direction;

    newPageIndex = Math.max(0, Math.min(newPageIndex, maxPageIndex));

    if (newPageIndex !== currentPageIndex) {
        currentPageIndex = newPageIndex;
        renderNotebookPage(currentPageIndex);
        console.log(`Navigated to page index: ${currentPageIndex}`);
    }
  }

  if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => changePage(-1));
  }
  if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => changePage(1));
  }

  document.addEventListener('keydown', (event) => {
      if (notebook && notebook.style.display !== 'none') {
          if (event.key === 'PageDown') {
              event.preventDefault();
              changePage(1);
          }
          if (event.key === 'PageUp') {
              event.preventDefault();
              changePage(-1);
          }
      }
  });
  // --- End Notebook Page Navigation Logic ---

  // Add message listener for Hytopia UI events
  // TODO: This message listener might not be reliable until client-side console errors (404s, asset loading, etc.) are resolved.
  // Fix those errors first if the notebook UI ('B' key) doesn't open.
  window.addEventListener('message', (event) => {
    // ADDED: Log all incoming event data immediately
    console.log('[UI Script] Received message:', JSON.stringify(event.data));

    const { type, payload } = event.data;

    if (type === 'update_notebook') {
        console.log('[UI Script] Received update_notebook:', payload);
        console.log('Updating notebook with entries:', payload.entries);

        window.notebookEntries = payload.entries || [];

        renderNotebookPage(currentPageIndex);
    } else if (type === 'show_case_solved') {
        showCaseSolvedScreen();
        console.log('[UI Script] Received show_case_solved');
    } else if (type === 'interaction_prompt') {
      if (!interactionPrompt) {
          console.error('Interaction prompt element missing!');
          return;
      }
      if (payload.show) {
        console.log('Showing interaction prompt: ', payload.text);
        interactionPrompt.textContent = payload.text || 'Interact [E]'; // Update text
        interactionPrompt.style.display = 'block';
      } else {
        console.log('Hiding interaction prompt');
        interactionPrompt.style.display = 'none';
      }
    } else if (type === 'show_notebook' && notebook) {
      console.log('Toggle notebook visibility:', payload.show);
      if (payload.show) {
        notebook.style.display = 'flex';
        currentPageIndex = 0;
        renderNotebookPage(currentPageIndex);
        console.log('Notebook displayed');
        // ADD Pointer lock release when notebook shown
        if (document.pointerLockElement) {
            console.log('Exiting pointer lock because notebook is shown.');
            document.exitPointerLock();
        }
      } else {
        notebook.style.display = 'none';
        console.log('Notebook hidden');
      }
    } else if (type === 'case_solved' && caseSolved) {
      console.log('Case solved notification received');
      if (payload.solved) {
        caseSolved.style.display = 'flex';
      }
    } else if (type === 'request_pointer_lock') {
        console.log('[UI Script] Received request_pointer_lock. Attempting to lock pointer.');
        // Request pointer lock on the document body or a specific game container element
        document.body.requestPointerLock = document.body.requestPointerLock ||
                                         document.body.mozRequestPointerLock ||
                                         document.body.webkitRequestPointerLock;
        if (document.body.requestPointerLock) {
            document.body.requestPointerLock();
            
            // --- Attempt to resume audio context after user gesture ---
            console.log('Pointer lock requested - this is our user gesture for audio.');
            console.log('Attempting to resume AudioContext (if suspended)...');
            // NOTE: This needs the actual Hytopia AudioContext instance or a message 
            // back to the server/client to trigger resume. Generic browser way shown below:
            if (window.AudioContext && typeof window.AudioContext !== 'undefined') { // Check if AudioContext API exists
                // We don't have a direct reference to Hytopia's context, 
                // but the user gesture *might* allow already playing sounds to resume.
                // If Hytopia exposes its context (e.g., window.hytopiaAudioContext):
                // if (window.hytopiaAudioContext && window.hytopiaAudioContext.state === 'suspended') {
                //    window.hytopiaAudioContext.resume().then(() => {
                //        console.log("Hytopia AudioContext resumed successfully via pointer lock gesture!");
                //    }).catch(err => console.error("Error resuming Hytopia AudioContext:", err));
                // }
                console.log('Generic AudioContext API exists. Browser might auto-resume audio now.');
            } else {
                console.warn('Browser AudioContext API not found.');
            }
             // --- End Audio Resume Attempt ---

        } else {
            console.warn('Pointer lock requested, but API not available.');
        }
    }
  });

  console.log('Hytopia UI Script fully initialized');
});