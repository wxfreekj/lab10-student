// Lab 10: Severe Weather - Tornado Development and Detection - Main JavaScript
// ESCI 240

document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "Lab 10: Severe Weather - Tornado Development and Detection initialized"
  );

  // Initialize progress tracking
  initializeProgressTracking();

  // Initialize form export
  setupFormExport();

  // Initialize input validation
  initializeValidation();
});

function initializeValidation() {
  // Temperature validation
  const tempInput = document.getElementById("q1-temp");
  if (tempInput) {
    tempInput.addEventListener("blur", function () {
      validateTemperature(this);
    });
  }

  // Dewpoint validation
  const dewptInput = document.getElementById("q1-dewpt");
  if (dewptInput) {
    dewptInput.addEventListener("blur", function () {
      validateDewpoint(this);
    });
  }

  // Wind speed validation
  const windSpdInput = document.getElementById("q1-windspd");
  if (windSpdInput) {
    windSpdInput.addEventListener("blur", function () {
      validateWindSpeed(this);
    });
  }

  // Wind direction validation
  const windDirInput = document.getElementById("q1-winddir");
  if (windDirInput) {
    windDirInput.addEventListener("blur", function () {
      validateWindDirection(this);
    });
  }

  // Textarea minimum length validation
  const textareas = document.querySelectorAll("textarea");
  textareas.forEach((textarea) => {
    textarea.addEventListener("blur", function () {
      validateTextareaLength(this);
    });
  });
}

function validateTemperature(input) {
  const value = parseFloat(input.value);
  const isValid = !isNaN(value) && value >= -50 && value <= 120;

  if (input.value && !isValid) {
    showValidationError(input, "Temperature should be between -50°F and 120°F");
    return false;
  } else {
    clearValidationError(input);
    return true;
  }
}

function validateDewpoint(input) {
  const value = parseFloat(input.value);
  const isValid = !isNaN(value) && value >= -50 && value <= 100;

  if (input.value && !isValid) {
    showValidationError(input, "Dewpoint should be between -50°F and 100°F");
    return false;
  } else {
    clearValidationError(input);
    return true;
  }
}

function validateWindSpeed(input) {
  const value = parseFloat(input.value);
  const isValid = !isNaN(value) && value >= 0 && value <= 150;

  if (input.value && !isValid) {
    showValidationError(input, "Wind speed should be between 0 and 150 knots");
    return false;
  } else {
    clearValidationError(input);
    return true;
  }
}

function validateWindDirection(input) {
  const value = input.value.trim();
  const validDirections = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"];

  if (!value) {
    showValidationError(input, "Please select a wind direction");
    return false;
  } else if (!validDirections.includes(value)) {
    showValidationError(
      input,
      "Please select a valid wind direction from the dropdown"
    );
    return false;
  } else {
    clearValidationError(input);
    return true;
  }
}

function validateTextareaLength(textarea) {
  const minLength = 50; // Minimum character requirement for explanations
  const value = textarea.value.trim();

  if (value && value.length < minLength) {
    showValidationError(
      textarea,
      `Please provide a more detailed explanation (at least ${minLength} characters)`
    );
    return false;
  } else {
    clearValidationError(textarea);
    return true;
  }
}

function showValidationError(input, message) {
  // Remove any existing error message
  clearValidationError(input);

  // Add error styling
  input.style.borderColor = "#dc2626";
  input.style.backgroundColor = "#fef2f2";

  // Create and add error message
  const errorDiv = document.createElement("div");
  errorDiv.className = "validation-error";
  errorDiv.style.color = "#dc2626";
  errorDiv.style.fontSize = "0.875rem";
  errorDiv.style.marginTop = "0.25rem";
  errorDiv.textContent = "⚠ " + message;

  input.parentElement.appendChild(errorDiv);
}

function clearValidationError(input) {
  // Remove error styling
  input.style.borderColor = "";
  input.style.backgroundColor = "";

  // Remove error message if exists
  const existingError = input.parentElement.querySelector(".validation-error");
  if (existingError) {
    existingError.remove();
  }
}

function validateAllInputs() {
  let isValid = true;
  const errors = [];

  // Validate temperature
  const tempInput = document.getElementById("q1-temp");
  if (tempInput && !validateTemperature(tempInput)) {
    isValid = false;
    errors.push("Temperature (Question 1)");
  }

  // Validate dewpoint
  const dewptInput = document.getElementById("q1-dewpt");
  if (dewptInput && !validateDewpoint(dewptInput)) {
    isValid = false;
    errors.push("Dewpoint (Question 1)");
  }

  // Validate wind speed
  const windSpdInput = document.getElementById("q1-windspd");
  if (windSpdInput && !validateWindSpeed(windSpdInput)) {
    isValid = false;
    errors.push("Wind Speed (Question 1)");
  }

  // Validate wind direction
  const windDirInput = document.getElementById("q1-winddir");
  if (windDirInput && !validateWindDirection(windDirInput)) {
    isValid = false;
    errors.push("Wind Direction (Question 1)");
  }

  // Validate textareas
  const textareas = document.querySelectorAll("textarea");
  textareas.forEach((textarea, index) => {
    if (!validateTextareaLength(textarea)) {
      isValid = false;
      errors.push(`Question ${index + 2} explanation`);
    }
  });

  return { isValid, errors };
}

function initializeProgressTracking() {
  const inputs = document.querySelectorAll("input, textarea, select");
  const progressBar = document.getElementById("progressBar");

  function updateProgress() {
    let filled = 0;
    inputs.forEach((input) => {
      if (input.value.trim() !== "") {
        filled++;
      }
    });

    const percentage = (filled / inputs.length) * 100;
    progressBar.style.width = percentage + "%";
  }

  inputs.forEach((input) => {
    input.addEventListener("input", updateProgress);
    input.addEventListener("change", updateProgress);
  });

  updateProgress();
}

function setupFormExport() {
  const exportBtn = document.getElementById("exportBtn");
  const exportStatus = document.getElementById("exportStatus");

  if (!exportBtn) {
    console.error("Export button not found");
    return;
  }

  exportBtn.addEventListener("click", function () {
    try {
      // Validate all inputs before exporting
      const validation = validateAllInputs();

      if (!validation.isValid) {
        exportStatus.innerHTML =
          "⚠️ Please fix the following errors before exporting:<br>" +
          validation.errors.map((err) => "• " + err).join("<br>");
        exportStatus.style.color = "#dc2626";

        // Scroll to first error
        const firstError = document.querySelector(
          '[style*="border-color: rgb(220, 38, 38)"]'
        );
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        return;
      }

      // Check if all required fields are filled
      const requiredFields = [
        { id: "q1-temp", name: "Temperature" },
        { id: "q1-dewpt", name: "Dewpoint" },
        { id: "q1-windspd", name: "Wind Speed" },
        { id: "q1-winddir", name: "Wind Direction" },
        { id: "q2-explain", name: "Question 2 Explanation" },
        { id: "q3-doppler", name: "Question 3 Explanation" },
        { id: "q4-dissipation", name: "Question 4 Explanation" },
      ];

      const emptyFields = [];
      requiredFields.forEach((field) => {
        const element = document.getElementById(field.id);
        if (element && !element.value.trim()) {
          emptyFields.push(field.name);
        }
      });

      if (emptyFields.length > 0) {
        exportStatus.innerHTML =
          "⚠️ Please complete the following required fields:<br>" +
          emptyFields.map((field) => "• " + field).join("<br>");
        exportStatus.style.color = "#dc2626";
        return;
      }

      const formData = collectFormData();
      const textContent = formatAnswers(formData);
      downloadTextFile(textContent, "Lab10_SevereWeather.txt");

      exportStatus.textContent = "✓ Lab answers exported successfully!";
      exportStatus.style.color = "#059669";

      setTimeout(() => {
        exportStatus.textContent = "";
      }, 5000);
    } catch (error) {
      console.error("Export error:", error);
      exportStatus.textContent = "✗ Error exporting answers. Please try again.";
      exportStatus.style.color = "#dc2626";
    }
  });
}

function collectFormData() {
  const formData = {
    studentName: "",
    labTitle: "Lab 10: Severe Weather – Tornado Development and Detection",
    totalPoints: 30,
    answers: {},
  };

  // Question 1: Concordia, Kansas Conditions (4 pts)
  formData.answers.q1 = {
    question: "Question 1: Concordia, Kansas Conditions (4 pts)",
    temperature: document.getElementById("q1-temp")?.value || "",
    dewpoint: document.getElementById("q1-dewpt")?.value || "",
    windSpeed: document.getElementById("q1-windspd")?.value || "",
    windDirection: document.getElementById("q1-winddir")?.value || "",
  };

  // Question 2: Rapid Storm Development (10 pts)
  formData.answers.q2 = {
    question: "Question 2: Rapid Storm Development (10 pts)",
    explanation: document.getElementById("q2-explain")?.value || "",
  };

  // Question 3: Doppler Radar Detection (8 pts)
  formData.answers.q3 = {
    question: "Question 3: Doppler Radar Detection (8 pts)",
    dopplerExplanation: document.getElementById("q3-doppler")?.value || "",
  };

  // Question 4: Storm Dissipation in Kansas (8 pts)
  formData.answers.q4 = {
    question: "Question 4: Storm Dissipation in Kansas (8 pts)",
    dissipationExplanation:
      document.getElementById("q4-dissipation")?.value || "",
  };

  return formData;
}

function formatAnswers(formData) {
  let text = "=".repeat(70) + "\n";
  text += "ESCI 240 - " + formData.labTitle + "\n";
  text += "Total Points: " + formData.totalPoints + "\n";
  text += "Submission Date: " + new Date().toLocaleString() + "\n";
  text += "=".repeat(70) + "\n\n";

  // Student Name
  text +=
    "Student Name: " + (formData.studentName || "[Enter your name]") + "\n";
  text += "=".repeat(70) + "\n\n";

  // Question 1: Concordia, Kansas Conditions
  text += formData.answers.q1.question + "\n";
  text += "-".repeat(70) + "\n";
  text += "Temperature: " + formData.answers.q1.temperature + "°F\n";
  text += "Dewpoint: " + formData.answers.q1.dewpoint + "°F\n";
  text += "Wind Speed: " + formData.answers.q1.windSpeed + " knots\n";
  text += "Wind Direction: " + formData.answers.q1.windDirection + "\n\n";

  // Question 2: Rapid Storm Development
  text += formData.answers.q2.question + "\n";
  text += "-".repeat(70) + "\n";
  text += formData.answers.q2.explanation + "\n\n";

  // Question 3: Doppler Radar Detection
  text += formData.answers.q3.question + "\n";
  text += "-".repeat(70) + "\n";
  text += formData.answers.q3.dopplerExplanation + "\n\n";

  // Question 4: Storm Dissipation in Kansas
  text += formData.answers.q4.question + "\n";
  text += "-".repeat(70) + "\n";
  text += formData.answers.q4.dissipationExplanation + "\n\n";

  text += "=".repeat(70) + "\n";
  text += "END OF LAB 10\n";
  text += "=".repeat(70) + "\n";

  return text;
}

function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
