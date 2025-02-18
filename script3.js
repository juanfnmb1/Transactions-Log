
const encodedPassword = "anVhcmk="; 


const encodedRedirectUrl = "azBpMDAzby5odG1s"; 


document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault(); 

  const password = document.getElementById("password").value.trim(); 

 
  const encodedInput = btoa(password); 

  if (encodedInput === encodedPassword) {
   
    const redirectUrl = atob(encodedRedirectUrl);
    window.location.href = redirectUrl;
  } else {
    alert("Incorrect password! Please try again.");
  }
});
