var timeoutCountdown = null;
var timeoutRefresh = null;
var dateSelector = '#formId_1 > div > div.r-table.col-xs-12 > table > tbody > tr > td:nth-child(3) > p:nth-child(2) > strong';
var totalCount = 120;
var countDownPrefix = '';
var initialUrl = 'https://www.dmv.ca.gov/wasapp/foa/clear.do?goTo=officeVisit';

var optionList = ["hasSeenIntro", "officeId", "taskCID", "taskRID", "taskVR", "numberItems", "firstName", "lastName", "phoneArea", "phonePrefix", "phoneSuffix", "dateBefore", "enabled", "sameDay"];
var mandatoryOptions = ["officeId", "firstName", "numberItems", "lastName", "phoneArea", "phonePrefix", "phoneSuffix", "dateBefore"];

var monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];

var logInfo = function (txt) {
  document.querySelector('#app_header > h1').innerHTML = txt;
}

var countDown = function(){
  totalCount--;
  logInfo(countDownPrefix + ' - re-ckecking in ' + totalCount + 's');

  if (totalCount <= 0) {
    document.location.href = initialUrl;
  } else {
    timeoutCountdown = window.setTimeout(countDown, 1000);
  }
}

var checkNewDates = function(options){
  // Intro
  if (!options.hasSeenIntro) {
    chrome.storage.sync.set({ hasSeenIntro: true }, function() {
      chrome.tabs.create({
        url: '/options.html'
      });
    });
  }

  // Check options
  if (!options.enabled) return;

  var missing = [];
  mandatoryOptions.forEach(o => {
    if (!options[o] || options[o] === "") missing.push(o);
  });

  if (missing.length) {
    logInfo('Please go to "DMV Appointment Checker" extension options to fill in: ' + missing.join(', '));
    return;
  }

  // Submitting forms
  if (document.location.href === 'https://www.dmv.ca.gov/wasapp/foa/confirmAppt.do#dac') {
    return chrome.storage.sync.set({ enabled: false }, () => {
      alert('Appointment booked!');
    });
    return;
  }

  // Submitting confirmation
  if (document.location.href === 'https://www.dmv.ca.gov/wasapp/foa/selectNotification.do#dac') {
    logInfo('Confirming Appointment...');
    document.querySelector('#ApptForm').setAttribute('action', document.querySelector('#ApptForm').getAttribute('action') + '#dac');
    document.querySelector('#ApptForm').submit();
    return;
  }

  // Submitting confirmation
  if (document.location.href === 'https://www.dmv.ca.gov/wasapp/foa/checkForOfficeVisitConflicts.do#dac') {
    logInfo('Confirming Notification...');
    document.querySelector('[name="ApptForm"]').setAttribute('action', document.querySelector('[name="ApptForm"]').getAttribute('action') + '#dac');
    document.querySelector('[name="ApptForm"]').submit();
    return;
  }

  // Inputting Appointment data
  if (document.location.href === initialUrl && document.querySelector('[name="officeId"]')) {
    document.querySelector('[name="officeId"]').value = options.officeId;
    if (document.querySelector('[name="numberItems"][value="' + options.numberItems + '"]')) {
      document.querySelector('[name="numberItems"][value="' + options.numberItems + '"]').checked = true;
    }
    document.querySelector('#taskRID').checked = (options.taskRID === true);
    document.querySelector('#taskCID').checked = (options.taskCID === true);
    document.querySelector('#taskVR').checked = (options.taskVR === true);
    document.querySelector('#first_name').value = options.firstName;
    document.querySelector('#last_name').value = options.lastName;
    document.querySelector('input[name="telArea"]').value = options.phoneArea;
    document.querySelector('input[name="telPrefix"]').value = options.phonePrefix;
    document.querySelector('input[name="telSuffix"]').value = options.phoneSuffix;
    document.querySelector('form[name="ApptForm"]').setAttribute('action', document.querySelector('form[name="ApptForm"]').getAttribute('action') + '#dac');
    document.querySelector('form[name="ApptForm"]').submit();
    return;
  }

  // Finding available Appointments
  if (document.location.href === 'https://www.dmv.ca.gov/wasapp/foa/findOfficeVisit.do#dac') {
    if (document.querySelector(dateSelector)) {
      logInfo('Date not found');
    }

    // Check Date
    var dd = document.querySelector(dateSelector).innerText.toString().trim().replace('at', '');
    var convertedDate = new Date(Date.parse(dd));

    if (isNaN(convertedDate.getTime())) {
      countDownPrefix = 'Invalid Date';
    }

    var dateBefore = new Date(Date.parse(options.dateBefore));
    var today = new Date();

    if (
      (convertedDate.getDate() === today.getDate()
      && convertedDate.getMonth() === today.getMonth()
      && convertedDate.getYear() === today.getYear()
      && options.sameDay
    ) || 
    (
      convertedDate.getTime() < dateBefore.getTime()
    )
    ) {
      localStorage.setItem('lastDate', dd);
      logInfo('Confirming Appointment...');
      document.querySelector('#formId_1').setAttribute('action', document.querySelector('#formId_1').getAttribute('action') + '#dac');
      document.querySelector('#formId_1').submit();
      return;
    } else {
      countDownPrefix = 'No availabilities before ' + monthNames[dateBefore.getMonth()] + ' ' + dateBefore.getDate();
    }

    clearTimeout(timeoutRefresh);
    clearTimeout(timeoutCountdown);
    timeoutRefresh = window.setTimeout(checkNewDates, 120 * 1000);
    countDown();
  }
};


chrome.storage.sync.get(optionList, checkNewDates);
