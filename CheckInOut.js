document.getElementById('checkindate').addEventListener('change', function() {
  // Assuming check-in is the current value, set the checkout date to at least one day later
  const checkInDate = new Date(this.value);
  const checkOutDate = new Date(checkInDate);
  
  // Add one day to the check-in date for the checkout date
  checkOutDate.setDate(checkOutDate.getDate() + 1);

  // Format the date as a string in the format 'yyyy-MM-dd'
  const formattedCheckoutDate = checkOutDate.toISOString().split('T')[0];

  const checkoutDateInput = document.getElementById('checkoutdate');
  checkoutDateInput.disabled = false; // Enable the checkout date input
  checkoutDateInput.min = formattedCheckoutDate; // Set the min attribute to one day after check-in date
});
