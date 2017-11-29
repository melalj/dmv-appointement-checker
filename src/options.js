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

function restoreOptions() {
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
  });
}

function attachSave() {
  var inputs = Array.from(document.querySelectorAll("[data-save]"));
  inputs.forEach(input => {
    input.addEventListener("change", saveOptions);
  });
}

function loadGA() {
  (function(i, s, o, g, r, a, m) {
    i["GoogleAnalyticsObject"] = r;
    (i[r] =
      i[r] ||
      function() {
        (i[r].q = i[r].q || []).push(arguments);
      }),
      (i[r].l = 1 * new Date());
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(
    window,
    document,
    "script",
    "https://www.google-analytics.com/analytics.js",
    "ga"
  );

  var version = chrome.app.getDetails().version;
  

  ga("create", "UA-110375132-2", "auto");

  ga("set", "checkProtocolTask", function() {});

  ga("require", "displayfeatures");

  ga("send", "pageview", "/" + version + "/options.html");
}

document.addEventListener("DOMContentLoaded", function() {
  attachSave();
  restoreOptions();
  loadGA();
});
