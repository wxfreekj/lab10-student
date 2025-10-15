/**
 * Generic form export utility for lab assignments
 */

/**
 * Export lab answers to a text file for Canvas submission
 * @param {Object} config - Lab configuration object
 * @returns {string} - Filename of the exported file
 */
export function exportLabAnswers(config) {
  const { labNumber, labName, totalPoints, questions } = config;

  let output = "";
  output += `ASSIGNMENT=${labName}\n`;
  output += `LAB_NUMBER=${labNumber}\n`;
  output += `DATE=${new Date().toISOString()}\n`;
  output += `TOTAL_POINTS=${totalPoints}\n`;
  output += "---BEGIN_ANSWERS---\n";

  // Export each question
  questions.forEach((q) => {
    if (q.id) {
      const element = document.getElementById(q.id);
      if (element) {
        output += `${q.key}=${element.value}\n`;
      }
    } else if (q.note) {
      output += `${q.key}=${q.note}\n`;
    }
  });

  output += "---END_ANSWERS---\n";
  output += "\nIMPORTANT: Please also upload any required images to Canvas.\n";

  // Create and download file
  const blob = new Blob([output], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const filename = `Lab${labNumber}_Answers_${Date.now()}.txt`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return filename;
}

/**
 * Clear all form inputs
 */
export function clearLabForm() {
  if (
    confirm(
      "⚠️ Are you sure you want to clear all answers? This cannot be undone."
    )
  ) {
    const inputs = document.querySelectorAll(
      'input[type="text"], input[type="number"], select, textarea'
    );
    inputs.forEach((input) => {
      input.value = "";
    });

    // Trigger change events to update progress bar
    inputs.forEach((input) => {
      input.dispatchEvent(new Event("change"));
    });

    alert("✅ All answers have been cleared.");
  }
}
