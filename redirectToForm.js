document.querySelector('.form form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Retrieve form values
  const checkInDate = document.getElementById('checkindate').value;
  const checkOutDate = document.getElementById('checkoutdate').value;
  const adults = document.querySelector('input[name="adults"]').value;
  const children = document.querySelector('input[name="children"]').value;

  // Store the data in local storage
  localStorage.setItem('reservationData', JSON.stringify({
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
    adults: adults,
    children: children
  }));

  // Redirect to the new screen (update with your actual URL)
  window.location.href = 'screens/form.html';
});