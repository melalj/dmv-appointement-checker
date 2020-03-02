var timeoutCountdown = null;
var timeoutRefresh = null;
var dateSelector = '#formId_1 > div > div.r-table.col-xs-12 > table > tbody > tr > td:nth-child(3) > p:nth-child(2) > strong';
var allTakenRegex = /Sorry, all appointments at this office are currently taken/g;
var totalCount = 60;
var countDownPrefix = '';
var initialUrl = 'https://www.dmv.ca.gov/wasapp/foa/officeVisit.do';

var optionList = [
  'hasSeenIntro',
  'officeId',
  'taskCID',
  'taskRID',
  'taskVR',
  'numberItems',
  'firstName',
  'lastName',
  'phoneArea',
  'phonePrefix',
  'phoneSuffix',
  'dateBefore',
  'enabled',
  'sameDay',
];
var mandatoryOptions = ['officeId', 'firstName', 'numberItems', 'lastName', 'phoneArea', 'phonePrefix', 'phoneSuffix', 'dateBefore'];
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var logInfo = function(txt) {
  document.querySelector('#app_header > h1').innerHTML = txt;
};

var countDown = function() {
  totalCount--;
  logInfo(countDownPrefix + ' - re-ckecking in ' + totalCount + 's');

  if (totalCount <= 0) {
    document.location.href = initialUrl;
  } else {
    timeoutCountdown = window.setTimeout(countDown, 1000);
  }
};

var submitAppointment = function() {
  document.querySelector('form[id="findOffice"]').setAttribute('action', document.querySelector('form[id="findOffice"]').getAttribute('action'));
  document.querySelector('form[id="findOffice"]').submit();
};

var checkNewDates = function(options) {
  // Intro
  if (!options.hasSeenIntro) {
    chrome.storage.sync.set({hasSeenIntro: true}, function() {
      chrome.tabs.create({
        url: '/options.html',
      });
    });
  }

  // Check options
  if (!options.enabled) {
    logInfo('option not enabled');
    return;
  }

  var missing = [];
  mandatoryOptions.forEach(o => {
    if (!options[o] || options[o] === '') missing.push(o);
  });

  if (missing.length) {
    logInfo('Please go to "DMV Appointment Checker" extension options to fill in: ' + missing.join(', '));
    return;
  }

  // Submitting forms
  if (document.location.href === 'https://www.dmv.ca.gov/wasapp/foa/confirmAppt.do') {
    return chrome.storage.sync.set({enabled: false}, () => {
      alert('Appointment booked!');
    });
  }

  // Submitting confirmation
  if (document.location.href === 'https://www.dmv.ca.gov/wasapp/foa/selectNotification.do') {
    logInfo('Confirming Appointment...');
    document.querySelector('#ApptForm').setAttribute('action', document.querySelector('#ApptForm').getAttribute('action'));
    document.querySelector('#ApptForm').submit();
    return;
  }

  // Submitting confirmation
  if (document.location.href === 'https://www.dmv.ca.gov/wasapp/foa/checkForOfficeVisitConflicts.do') {
    logInfo('Confirming Notification...');
    document.querySelector('#ApptForm').setAttribute('action', document.querySelector('#ApptForm').getAttribute('action'));
    document.querySelector('#ApptForm').submit();
    return;
  }

  // Inputting Appointment data
  if (document.location.href === initialUrl && document.querySelector('[name="officeId"]')) {
    document.querySelector('[name="officeId"]').value = options.officeId;
    if (document.querySelector('[name="numberItems"][value="' + options.numberItems + '"]')) {
      document.querySelector('[name="numberItems"][value="' + options.numberItems + '"]').checked = true;
    }
    document.querySelector('#taskRID').checked = options.taskRID === true;
    document.querySelector('#taskCID').checked = options.taskCID === true;
    document.querySelector('#taskVR').checked = options.taskVR === true;
    document.querySelector('#firstName').value = options.firstName;
    document.querySelector('#lastName').value = options.lastName;
    document.querySelector('input[name="telArea"]').value = options.phoneArea;
    document.querySelector('input[name="telPrefix"]').value = options.phonePrefix;
    document.querySelector('input[name="telSuffix"]').value = options.phoneSuffix;
    window.setTimeout(submitAppointment, 1000);
    return;
  }

  // Finding available Appointments
  if (document.location.href === 'https://www.dmv.ca.gov/wasapp/foa/findOfficeVisit.do') {
    if (document.getElementsByTagName('html')[0].innerHTML.match(allTakenRegex)) {
      countDownPrefix = 'No availabilities';
    } else {
      // Check Date
      var dd = document
        .querySelector(dateSelector)
        .innerText.toString()
        .trim()
        .replace('at', '');
      var convertedDate = new Date(Date.parse(dd));

      if (isNaN(convertedDate.getTime())) {
        countDownPrefix = 'Invalid Date';
      }

      var dateBefore = new Date(Date.parse(options.dateBefore));
      var today = new Date();

      if (
        (convertedDate.getDate() === today.getDate() &&
          convertedDate.getMonth() === today.getMonth() &&
          convertedDate.getYear() === today.getYear() &&
          options.sameDay) ||
        convertedDate.getTime() < dateBefore.getTime()
      ) {
        localStorage.setItem('lastDate', dd);
        logInfo('Confirming Appointment...');
        document.querySelector('#formId_1').setAttribute('action', document.querySelector('#formId_1').getAttribute('action'));
        document.querySelector('#formId_1').submit();
        return;
      } else {
        countDownPrefix = 'No availabilities before ' + monthNames[dateBefore.getMonth()] + ' ' + dateBefore.getDate();
      }
    }

    clearTimeout(timeoutRefresh);
    clearTimeout(timeoutCountdown);
    timeoutRefresh = window.setTimeout(checkNewDates, 120 * 1000);
    console.log('starting countdown');
    countDown();
  }
};
chrome.storage.sync.get(optionList, checkNewDates);
