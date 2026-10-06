// CAMT Study Room Booking — vanilla JS single-page app.
// All state lives in memory and is re-seeded whenever this script runs
// (i.e. on every full page load/reload). Hash routing, no build step.

(function () {
  'use strict';

  var appEl = document.getElementById('app');
  var serviceDown = new URLSearchParams(location.search).get('service') === 'down';

  var SEED_ROOMS = [
    { id: 'room-a', name: 'Room A', capacity: 4, floor: '2nd floor', status: 'Available' },
    { id: 'room-b', name: 'Room B', capacity: 6, floor: '2nd floor', status: 'Available' },
    { id: 'room-c', name: 'Room C', capacity: 8, floor: '3rd floor', status: 'Unavailable' },
    { id: 'room-d', name: 'Room D', capacity: 4, floor: '3rd floor', status: 'Available' },
    { id: 'quiet-pod-1', name: 'Quiet Pod 1', capacity: 1, floor: '4th floor', status: 'Available' }
  ];

  function seedBookings() {
    return [
      {
        ref: 'BK-1001',
        roomId: 'room-b',
        date: '2026-10-05',
        start: '13:00',
        duration: 2,
        purpose: 'Group study',
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
      }
    ];
  }

  var state = {
    rooms: SEED_ROOMS,
    bookings: seedBookings(),
    nextRefNumber: 1002
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function findRoom(roomId) {
    return state.rooms.filter(function (r) { return r.id === roomId; })[0];
  }

  function findBooking(ref) {
    return state.bookings.filter(function (b) { return b.ref === ref; })[0];
  }

  function activeBookingCount() {
    return state.bookings.filter(function (b) { return b.status === 'CONFIRMED'; }).length;
  }

  function timeOptions() {
    var options = [];
    for (var h = 8; h <= 20; h++) {
      options.push((h < 10 ? '0' + h : String(h)) + ':00');
    }
    return options;
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function formatTimeRange(start, durationHours) {
    var parts = start.split(':');
    var h = Number(parts[0]);
    var m = Number(parts[1]);
    var endH = h + Number(durationHours);
    return start + ' - ' + pad2(endH) + ':' + pad2(m);
  }

  // ---------- Router ----------

  function route() {
    if (!location.hash) {
      location.hash = '#/rooms';
      return; // hashchange will call route() again
    }
    var hash = location.hash.slice(1);
    var match;

    if (hash === '/rooms') {
      renderRooms();
      return;
    }
    match = hash.match(/^\/book\/([^/]+)$/);
    if (match) {
      renderBookingForm(match[1], {});
      return;
    }
    match = hash.match(/^\/confirmed\/([^/]+)$/);
    if (match) {
      renderConfirmed(match[1]);
      return;
    }
    if (hash === '/my-bookings') {
      renderMyBookings({});
      return;
    }
    location.hash = '#/rooms';
  }

  window.addEventListener('hashchange', route);

  // ---------- Rooms page ----------

  function renderRooms() {
    var html = '<h1>Rooms</h1><div class="room-list">';
    state.rooms.forEach(function (room) {
      var available = room.status === 'Available';
      html += '' +
        '<div class="room-card" data-testid="room-card">' +
        '  <div class="info">' +
        '    <h2>' + escapeHtml(room.name) + '</h2>' +
        '    <p>Capacity: ' + room.capacity + '</p>' +
        '    <p>' + escapeHtml(room.floor) + '</p>' +
        '    <span class="status-badge ' + (available ? 'available' : 'unavailable') + '" data-testid="room-status">' + room.status + '</span>' +
        '  </div>' +
        '  <button type="button" class="book-room-btn" data-room-id="' + room.id + '" ' + (available ? '' : 'disabled') + '>' + (available ? 'Book' : 'Unavailable') + '</button>' +
        '</div>';
    });
    html += '</div>';
    appEl.innerHTML = html;

    Array.prototype.forEach.call(appEl.querySelectorAll('.book-room-btn'), function (btn) {
      btn.addEventListener('click', function () {
        location.hash = '#/book/' + btn.getAttribute('data-room-id');
      });
    });
  }

  // ---------- Booking form ----------

  function renderBookingForm(roomId, opts) {
    var room = findRoom(roomId);
    if (!room) {
      location.hash = '#/rooms';
      return;
    }
    var draft = opts.draft || { date: '', start: '', duration: '', purpose: '', agree: false };
    var errors = opts.errors || {};
    var banner = opts.banner || null;

    var html = '<h1>Book ' + escapeHtml(room.name) + '</h1>';

    if (banner) {
      html += '<div class="alert-banner" role="alert" data-testid="form-error">' + escapeHtml(banner) + '</div>';
    }

    html += '<form novalidate>';

    html += '<div class="form-field">';
    html += '<label for="date-input">Date</label>';
    html += '<input type="date" id="date-input" class="' + (errors.date ? 'invalid' : '') + '" value="' + escapeHtml(draft.date) + '">';
    if (errors.date) html += '<div class="field-error" data-testid="date-error">' + escapeHtml(errors.date) + '</div>';
    html += '</div>';

    html += '<div class="form-field">';
    html += '<label for="start-input">Start time</label>';
    html += '<select id="start-input" class="' + (errors.start ? 'invalid' : '') + '">';
    html += '<option value=""' + (!draft.start ? ' selected' : '') + '>Select a time</option>';
    timeOptions().forEach(function (t) {
      html += '<option value="' + t + '"' + (draft.start === t ? ' selected' : '') + '>' + t + '</option>';
    });
    html += '</select>';
    if (errors.start) html += '<div class="field-error" data-testid="start-error">' + escapeHtml(errors.start) + '</div>';
    html += '</div>';

    html += '<div class="form-field">';
    html += '<label for="duration-input">Duration (hours)</label>';
    html += '<input type="number" id="duration-input" class="' + (errors.duration ? 'invalid' : '') + '" value="' + escapeHtml(draft.duration) + '">';
    if (errors.duration) html += '<div class="field-error" data-testid="duration-error">' + escapeHtml(errors.duration) + '</div>';
    html += '</div>';

    html += '<div class="form-field">';
    html += '<label for="purpose-input">Purpose</label>';
    html += '<input type="text" id="purpose-input" class="' + (errors.purpose ? 'invalid' : '') + '" value="' + escapeHtml(draft.purpose) + '">';
    if (errors.purpose) html += '<div class="field-error" data-testid="purpose-error">' + escapeHtml(errors.purpose) + '</div>';
    html += '</div>';

    html += '<div class="form-field checkbox-field">';
    html += '<input type="checkbox" id="policy-input"' + (draft.agree ? ' checked' : '') + '>';
    html += '<label for="policy-input">I agree to the room usage policy</label>';
    html += '</div>';
    if (errors.policy) html += '<div class="field-error" data-testid="policy-error">' + escapeHtml(errors.policy) + '</div>';

    html += '<div class="form-actions">';
    html += '<button type="button" id="confirm-btn">Confirm booking</button>';
    html += '<button type="button" class="secondary" id="cancel-btn">Cancel</button>';
    html += '</div>';
    html += '</form>';

    html += '' +
      '<dialog id="discard-dialog">' +
      '  <p>Discard this booking?</p>' +
      '  <div class="dialog-actions">' +
      '    <button type="button" id="keep-editing-btn">Keep editing</button>' +
      '    <button type="button" id="discard-btn">Discard</button>' +
      '  </div>' +
      '</dialog>';

    appEl.innerHTML = html;

    document.getElementById('confirm-btn').addEventListener('click', function () {
      onConfirm(roomId);
    });

    var discardDialog = document.getElementById('discard-dialog');
    document.getElementById('cancel-btn').addEventListener('click', function () {
      discardDialog.showModal();
    });
    document.getElementById('keep-editing-btn').addEventListener('click', function () {
      discardDialog.close();
    });
    document.getElementById('discard-btn').addEventListener('click', function () {
      discardDialog.close();
      location.hash = '#/rooms';
    });
  }

  function onConfirm(roomId) {
    var date = document.getElementById('date-input').value;
    var start = document.getElementById('start-input').value;
    var durationRaw = document.getElementById('duration-input').value;
    var purpose = document.getElementById('purpose-input').value;
    var agree = document.getElementById('policy-input').checked;

    var draft = { date: date, start: start, duration: durationRaw, purpose: purpose, agree: agree };
    var errors = {};

    if (!date) errors.date = "Date can't be empty.";
    if (!start) errors.start = "Start time can't be empty.";
    if (!durationRaw) {
      errors.duration = "Duration can't be empty.";
    } else {
      var durationNum = Number(durationRaw);
      if (!Number.isInteger(durationNum) || durationNum < 1 || durationNum > 3) {
        errors.duration = 'Duration must be between 1 and 3 hours.';
      }
    }
    if (!purpose) errors.purpose = "Purpose can't be empty.";

    if (Object.keys(errors).length > 0) {
      renderBookingForm(roomId, { draft: draft, errors: errors, banner: null });
      return;
    }

    if (!agree) {
      renderBookingForm(roomId, { draft: draft, errors: { policy: 'You must agree to the room usage policy.' }, banner: null });
      return;
    }

    if (activeBookingCount() >= 2) {
      renderBookingForm(roomId, { draft: draft, errors: {}, banner: 'You have reached the limit of 2 active bookings.' });
      return;
    }

    if (serviceDown) {
      renderBookingForm(roomId, { draft: draft, errors: {}, banner: 'Booking could not be saved. Please try again later.' });
      return;
    }

    var ref = 'BK-' + state.nextRefNumber;
    state.nextRefNumber += 1;
    state.bookings.push({
      ref: ref,
      roomId: roomId,
      date: date,
      start: start,
      duration: Number(durationRaw),
      purpose: purpose,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    });

    location.hash = '#/confirmed/' + ref;
  }

  // ---------- Confirmed page ----------

  function renderConfirmed(ref) {
    var booking = findBooking(ref);
    if (!booking) {
      location.hash = '#/rooms';
      return;
    }
    var room = findRoom(booking.roomId);
    var timeRange = formatTimeRange(booking.start, booking.duration);

    appEl.innerHTML = '' +
      '<h1>Booking confirmed</h1>' +
      '<div class="confirmed-details">' +
      '  <p><span class="label">Reference:</span><span data-testid="booking-ref">' + escapeHtml(booking.ref) + '</span></p>' +
      '  <p><span class="label">Room:</span><span data-testid="booking-room">' + escapeHtml(room.name) + '</span></p>' +
      '  <p><span class="label">Date:</span><span data-testid="booking-date">' + escapeHtml(booking.date) + '</span></p>' +
      '  <p><span class="label">Time:</span><span data-testid="booking-time">' + escapeHtml(timeRange) + '</span></p>' +
      '</div>' +
      '<p><a href="#/my-bookings">View my bookings</a></p>';
  }

  // ---------- My bookings page ----------

  function renderMyBookings(opts) {
    var message = opts.message || null;

    var html = '<h1>My bookings</h1>';
    if (message) {
      html += '<div class="status-message" role="status" data-testid="cancel-message">' + escapeHtml(message) + '</div>';
    }
    html += '<div class="booking-list">';
    state.bookings.forEach(function (booking) {
      var room = findRoom(booking.roomId);
      var timeRange = formatTimeRange(booking.start, booking.duration);
      var statusClass = booking.status === 'CONFIRMED' ? 'confirmed' : 'cancelled';
      html += '' +
        '<div class="booking-row" data-testid="booking-row">' +
        '  <div class="info">' +
        '    <p class="ref">' + escapeHtml(booking.ref) + '</p>' +
        '    <p>' + escapeHtml(room.name) + '</p>' +
        '    <p>' + escapeHtml(booking.date) + '</p>' +
        '    <p>' + escapeHtml(timeRange) + '</p>' +
        '    <span class="status-badge ' + statusClass + '" data-testid="booking-status">' + booking.status + '</span>' +
        '  </div>';
      if (booking.status === 'CONFIRMED') {
        html += '<button type="button" class="cancel-booking-btn" data-ref="' + booking.ref + '">Cancel booking</button>';
      }
      html += '</div>';
    });
    html += '</div>';

    html += '' +
      '<dialog id="cancel-dialog">' +
      '  <p id="cancel-dialog-text"></p>' +
      '  <div class="dialog-actions">' +
      '    <button type="button" id="keep-booking-btn">Keep booking</button>' +
      '    <button type="button" id="yes-cancel-btn">Yes, cancel</button>' +
      '  </div>' +
      '</dialog>';

    appEl.innerHTML = html;

    var cancelDialog = document.getElementById('cancel-dialog');
    var cancelDialogText = document.getElementById('cancel-dialog-text');
    var pendingRef = null;

    Array.prototype.forEach.call(appEl.querySelectorAll('.cancel-booking-btn'), function (btn) {
      btn.addEventListener('click', function () {
        pendingRef = btn.getAttribute('data-ref');
        cancelDialogText.textContent = 'Cancel booking ' + pendingRef + '?';
        cancelDialog.showModal();
      });
    });

    document.getElementById('keep-booking-btn').addEventListener('click', function () {
      cancelDialog.close();
    });

    document.getElementById('yes-cancel-btn').addEventListener('click', function () {
      var booking = findBooking(pendingRef);
      if (booking) {
        booking.status = 'CANCELLED';
      }
      cancelDialog.close();
      renderMyBookings({ message: 'Booking ' + pendingRef + ' cancelled.' });
    });
  }

  // ---------- Init ----------

  route();
})();
