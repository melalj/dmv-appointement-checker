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
    cb();
  });
}

function attachSave() {
  var inputs = Array.from(document.querySelectorAll("[data-save]"));
  inputs.forEach(input => {
    input.addEventListener("change", saveOptions);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  attachSave();
  restoreOptions(() => {
    var startDate = new Date();
    startDate.setDate(startDate.getDate()-1);
    
    var endDate = new Date(Date.parse(document.getElementById('dateBefore').value));
    
    var dp = $('#dp').datepicker({
      daysOfWeekDisabled: "0,6",
      todayHighlight: true,
      startDate,
    }).on('changeDate', function(e) {
      var val = e.date.toString().replace('00:00:00', '23:59:59');
      document.getElementById('dateBefore').value = val;
      saveOptions();
    });
  
    dp.datepicker('update', new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));
  });
});
