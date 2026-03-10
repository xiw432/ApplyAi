import { supabase } from "./supabase.js";

const BUCKET_NAME = "application-documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Initialize storage bucket (run once)
 */
async function initializeStorageBucket() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE,
      });

      if (error) {
        console.error("Error creating bucket:", error);
      } else {
        console.log("Storage bucket created successfully");
      }
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
}

/**
 * Upload document for an application
 */
async function uploadDocument(applicationId, file, documentType) {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file selected");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Generate file path: user_id/application_id/document_type_timestamp.ext
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${documentType}_${timestamp}.${fileExt}`;
    const filePath = `${user.id}/${applicationId}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Save metadata to database (optional - using application notes or separate table)
    await saveDocumentMetadata(applicationId, {
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      document_type: documentType,
      uploaded_at: new Date().toISOString(),
    });

    return {
      success: true,
      path: filePath,
      fileName: file.name,
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Save document metadata (store in application notes or create separate table)
 */
async function saveDocumentMetadata(applicationId, metadata) {
  try {
    // For now, we'll store metadata in a JSON field or notes
    // In production, create a separate documents table
    const { data: app } = await supabase
      .from("applications")
      .select("documents")
      .eq("id", applicationId)
      .single();

    let documents = [];
    try {
      documents = app?.documents ? JSON.parse(app.documents) : [];
    } catch (e) {
      documents = [];
    }

    documents.push(metadata);

    await supabase
      .from("applications")
      .update({ documents: JSON.stringify(documents) })
      .eq("id", applicationId);
  } catch (error) {
    console.error("Error saving document metadata:", error);
  }
}

/**
 * Get uploaded documents for an application
 */
async function getApplicationDocuments(applicationId) {
  try {
    const { data: app, error } = await supabase
      .from("applications")
      .select("documents")
      .eq("id", applicationId)
      .single();

    if (error) {
      console.error("Error fetching documents:", error);
      return [];
    }

    if (!app?.documents) {
      return [];
    }

    try {
      return JSON.parse(app.documents);
    } catch (e) {
      return [];
    }
  } catch (error) {
    console.error("Error getting documents:", error);
    return [];
  }
}

/**
 * Download/view document
 */
async function downloadDocument(filePath, fileName) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      throw error;
    }

    // Create download link
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error downloading document:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete document
 */
async function deleteDocument(applicationId, filePath) {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (storageError) {
      throw storageError;
    }

    // Remove from metadata
    const { data: app } = await supabase
      .from("applications")
      .select("documents")
      .eq("id", applicationId)
      .single();

    if (app?.documents) {
      let documents = JSON.parse(app.documents);
      documents = documents.filter(doc => doc.file_path !== filePath);

      await supabase
        .from("applications")
        .update({ documents: JSON.stringify(documents) })
        .eq("id", applicationId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Open upload modal for an application
 */
function openUploadModal(applicationId, applicationName) {
  let modal = document.getElementById("upload-document-modal");

  if (!modal) {
    createUploadModal();
    modal = document.getElementById("upload-document-modal");
  }

  // Set application info
  document.getElementById("upload-app-id").value = applicationId;
  document.getElementById("upload-app-name").textContent = applicationName || "Application";

  // Reset form
  document.getElementById("upload-document-type").value = "sop";
  document.getElementById("upload-file-input").value = "";
  document.getElementById("upload-file-name").textContent = "No file selected";

  // Show modal
  modal.style.display = "flex";
}

/**
 * Close upload modal
 */
function closeUploadModal() {
  const modal = document.getElementById("upload-document-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

/**
 * Create upload modal
 */
function createUploadModal() {
  const modal = document.createElement("div");
  modal.id = "upload-document-modal";
  modal.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
  `;

  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 28px; width: 90%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <h3 style="font-size: 18px; font-weight: 700; color: #111; margin: 0 0 4px;">Upload Document</h3>
          <p id="upload-app-name" style="font-size: 13px; color: #6B7280; margin: 0;">Application</p>
        </div>
        <div onclick="closeUploadModal()" style="cursor: pointer; color: #9CA3AF; font-size: 24px; line-height: 1; padding: 4px;" onmouseover="this.style.color='#111'" onmouseout="this.style.color='#9CA3AF'">×</div>
      </div>

      <input type="hidden" id="upload-app-id">

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">Document Type</label>
        <select id="upload-document-type" style="width: 100%; padding: 10px 12px; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none;" onfocus="this.style.borderColor='#3148E8'" onblur="this.style.borderColor='#E5E7EB'">
          <option value="sop">Statement of Purpose</option>
          <option value="cv">CV/Resume</option>
          <option value="passport">Passport Copy</option>
          <option value="transcript">Transcript</option>
          <option value="lor">Letter of Recommendation</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">Select File</label>
        <div style="position: relative;">
          <input type="file" id="upload-file-input" onchange="handleFileSelect(this)" style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;">
          <div style="padding: 12px 16px; border: 2px dashed #E5E7EB; border-radius: 8px; text-align: center; background: #F9FAFB; cursor: pointer;" onmouseover="this.style.borderColor='#3148E8'" onmouseout="this.style.borderColor='#E5E7EB'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 8px;">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <div id="upload-file-name" style="font-size: 13px; color: #6B7280;">No file selected</div>
            <div style="font-size: 11px; color: #9CA3AF; margin-top: 4px;">Max size: 10MB</div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button onclick="closeUploadModal()" style="flex: 1; padding: 12px; background: #F3F4F6; color: #374151; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;" onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">Cancel</button>
        <button onclick="handleUploadSubmit()" style="flex: 1; padding: 12px; background: #3148E8; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;" onmouseover="this.style.background='#2337C7'" onmouseout="this.style.background='#3148E8'">Upload</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close on outside click
  modal.addEventListener("click", function(e) {
    if (e.target === modal) {
      closeUploadModal();
    }
  });
}

/**
 * Handle file selection
 */
function handleFileSelect(input) {
  const fileNameEl = document.getElementById("upload-file-name");
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    fileNameEl.textContent = `${file.name} (${sizeMB} MB)`;
  } else {
    fileNameEl.textContent = "No file selected";
  }
}

/**
 * Handle upload submission
 */
async function handleUploadSubmit() {
  const applicationId = document.getElementById("upload-app-id").value;
  const documentType = document.getElementById("upload-document-type").value;
  const fileInput = document.getElementById("upload-file-input");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file");
    return;
  }

  // Show loading
  const uploadBtn = event.target;
  const originalText = uploadBtn.textContent;
  uploadBtn.textContent = "Uploading...";
  uploadBtn.disabled = true;

  // Upload document
  const result = await uploadDocument(applicationId, file, documentType);

  if (result.success) {
    if (typeof showToast === "function") {
      showToast("Document uploaded successfully");
    } else {
      alert("Document uploaded successfully");
    }
    closeUploadModal();
    
    // Reload tracker if function exists
    if (typeof loadApplications === "function") {
      loadApplications();
    }
  } else {
    alert("Upload failed: " + result.error);
    uploadBtn.textContent = originalText;
    uploadBtn.disabled = false;
  }
}

/**
 * Show documents for an application
 */
async function showApplicationDocuments(applicationId, applicationName) {
  const documents = await getApplicationDocuments(applicationId);

  let modal = document.getElementById("documents-view-modal");
  if (!modal) {
    createDocumentsViewModal();
    modal = document.getElementById("documents-view-modal");
  }

  // Set application name
  document.getElementById("docs-app-name").textContent = applicationName || "Application";

  // Render documents
  const container = document.getElementById("documents-list");
  if (documents.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: #9CA3AF; font-size: 13px;">
        No documents uploaded yet
      </div>
    `;
  } else {
    container.innerHTML = documents.map(doc => `
      <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 8px;">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: #EFF6FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; font-weight: 600; color: #111; margin-bottom: 2px;">${escapeHtml(doc.file_name)}</div>
          <div style="font-size: 11px; color: #9CA3AF;">${formatDocumentType(doc.document_type)} · ${formatFileSize(doc.file_size)} · ${formatDate(doc.uploaded_at)}</div>
        </div>
        <button onclick="downloadDocument('${doc.file_path}', '${escapeHtml(doc.file_name)}')" style="padding: 6px 12px; background: #F3F4F6; color: #374151; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;" onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">Download</button>
        <button onclick="confirmDeleteDocument('${applicationId}', '${doc.file_path}')" style="padding: 6px 12px; background: #FEE2E2; color: #DC2626; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;" onmouseover="this.style.background='#FCA5A5'" onmouseout="this.style.background='#FEE2E2'">Delete</button>
      </div>
    `).join("");
  }

  modal.style.display = "flex";
}

/**
 * Create documents view modal
 */
function createDocumentsViewModal() {
  const modal = document.createElement("div");
  modal.id = "documents-view-modal";
  modal.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
  `;

  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 28px; width: 90%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <h3 style="font-size: 18px; font-weight: 700; color: #111; margin: 0 0 4px;">Documents</h3>
          <p id="docs-app-name" style="font-size: 13px; color: #6B7280; margin: 0;">Application</p>
        </div>
        <div onclick="closeDocumentsModal()" style="cursor: pointer; color: #9CA3AF; font-size: 24px; line-height: 1; padding: 4px;" onmouseover="this.style.color='#111'" onmouseout="this.style.color='#9CA3AF'">×</div>
      </div>

      <div id="documents-list" style="flex: 1; overflow-y: auto; margin-bottom: 20px;">
        <!-- Documents will be loaded here -->
      </div>

      <button onclick="closeDocumentsModal()" style="width: 100%; padding: 12px; background: #F3F4F6; color: #374151; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;" onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", function(e) {
    if (e.target === modal) {
      closeDocumentsModal();
    }
  });
}

/**
 * Close documents modal
 */
function closeDocumentsModal() {
  const modal = document.getElementById("documents-view-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

/**
 * Confirm delete document
 */
async function confirmDeleteDocument(applicationId, filePath) {
  if (!confirm("Are you sure you want to delete this document?")) {
    return;
  }

  const result = await deleteDocument(applicationId, filePath);

  if (result.success) {
    if (typeof showToast === "function") {
      showToast("Document deleted");
    }
    // Refresh the documents view
    const appName = document.getElementById("docs-app-name").textContent;
    showApplicationDocuments(applicationId, appName);
  } else {
    alert("Failed to delete document: " + result.error);
  }
}

/**
 * Helper functions
 */
function formatDocumentType(type) {
  const types = {
    sop: "Statement of Purpose",
    cv: "CV/Resume",
    passport: "Passport",
    transcript: "Transcript",
    lor: "Letter of Recommendation",
    other: "Other",
  };
  return types[type] || type;
}

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Expose functions globally
window.openUploadModal = openUploadModal;
window.closeUploadModal = closeUploadModal;
window.handleFileSelect = handleFileSelect;
window.handleUploadSubmit = handleUploadSubmit;
window.showApplicationDocuments = showApplicationDocuments;
window.closeDocumentsModal = closeDocumentsModal;
window.downloadDocument = downloadDocument;
window.confirmDeleteDocument = confirmDeleteDocument;
window.initializeStorageBucket = initializeStorageBucket;

// Initialize storage bucket on load
initializeStorageBucket();
