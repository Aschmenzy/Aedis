document.addEventListener('DOMContentLoaded', () => {
  // Check if reservation data is stored in localStorage
  const storedData = localStorage.getItem('reservationData');
  if (storedData) {
    const data = JSON.parse(storedData);

    // Populate the form fields
    document.getElementById('firstName').value = data.firstName || '';
    document.getElementById('lastName').value = data.lastName || '';
    document.getElementById('checkindate').value = data.checkInDate || '';
    document.getElementById('checkoutdate').value = data.checkOutDate || '';
    document.getElementById('adults').value = data.adults || '';
    document.getElementById('children').value = data.children || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('country').value = data.country || '';
  }
});