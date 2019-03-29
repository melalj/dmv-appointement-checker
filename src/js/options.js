var timeoutStatus;

function saveOptions() {
  var data = {};
  var inputs = Array.from(document.querySelectorAll("[data-save]"));
  inputs.forEach(input => {
    if (input.getAttribute("type") === "checkbox") {
      data[input.id] = input.checked;
    } else {
      data[input.id] = input.value;
    }
  });
  chrome.storage.sync.set(data, function() {
    convertDate();
    document.getElementById("status").innerHTML =
      '<p class="bg-success">Options saved</p>';
    clearTimeout(timeoutStatus);
    timeoutStatus = window.setTimeout(() => {
      document.getElementById("status").innerHTML = "";
    }, 3000);
  });
}
function restoreOptions(cb) {
  var optionsList = Array.from(document.querySelectorAll("[data-save]")).map(
    d => d.id
  );
  chrome.storage.sync.get(optionsList, function(items) {
    optionsList.forEach(d => {
      if (items[d] && document.getElementById(d)) {
        if (document.getElementById(d).getAttribute("type") === "checkbox") {
          document.getElementById(d).checked = items[d];
        } else {
          document.getElementById(d).value = items[d];
        }
      }
    });
    convertDate();    
    cb();
  });
}

function convertDate() {
  if (!document.getElementById('timestamp')) return;
  var timestamp = Number(document.getElementById('timestamp').value);
  document.getElementById('convertedDate').innerHTML = new Date(timestamp).toLocaleString();
}

function attachSave() {
  var inputs = Array.from(document.querySelectorAll("[data-save]"));
  inputs.forEach(input => {
    input.addEventListener("change", saveOptions);
  });
}


document.addEventListener("DOMContentLoaded", function() {
  attachSave();
  restoreOptions(() => {});
});
