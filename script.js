
let isInputOpen = false;

const clickedButton = document.getElementById("newEntry");
clickedButton.onclick = () => {
  if (!isInputOpen) {
    createInput(); // Call the function to create the input form
    isInputOpen = true; // Mark the form as open
  } else {
    alert(
      "Ya hay un formulario de entrada abierto. Por favor, complétalo primero."
    );
  }
};

const doneButton = document.createElement("button");
doneButton.textContent = "Eliminar Todo";
doneButton.style.backgroundColor = "#dc3545";
doneButton.style.width = "45%";
doneButton.style.marginTop = "15px";
doneButton.onclick = () => {
  // Fetch the current list of transactions
  fetch("https://chain-just-parrot.glitch.me/transactions")
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        alert("No hay transacciones para eliminar.");
      } else {
        if (
          confirm(
            "¿Estás seguro de que quieres borrar todas las transacciones? Esto no se puede revertir."
          )
        ) {
          fetch("https://chain-just-parrot.glitch.me/delete-all-entries", {
            method: "DELETE",
          })
            .then((response) => {
              if (response.ok) {
                fetchAndDisplayTransactions(); // Refresh the displayed transactions
              } else {
                alert("Error borrando las transacciones.");
              }
            })
            .catch((error) => {
              console.error("Error borrando las transacciones.", error);
              alert("Error borrando las transacciones.");
            });
        }
      }
    })
    .catch((error) => {
      console.error("Error obteniendo estas transacciones.", error);
      alert("Error obteniendo estas transacciones.");
    });
};

const lineBreak = document.createElement("br");
const newEntryContainer = document.getElementById("container");
newEntryContainer.appendChild(lineBreak);
newEntryContainer.appendChild(doneButton);

const calculateButton = document.createElement("button");
calculateButton.textContent = "Calcular Total";
calculateButton.style.backgroundColor = "black";
calculateButton.style.width = "45%";
calculateButton.style.marginTop = "15px";

newEntryContainer.appendChild(calculateButton);
calculateButton.onclick = () => {
  fetch("https://chain-just-parrot.glitch.me/transactions")
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        const calcular = document.getElementById("calculation");
        calcular.textContent = `Total hasta ahora es: $0`;
        calcular.style.display = "block"; // Make the calculation visible
        calcular.style.fontSize = "20px";
      } else {
        let totalAmount = 0;
        let zelleAmount = 0;
        let cloverAmount = 0;
        let cashAmount = 0;

        // Loop through the data and sum the amounts based on the payment type
        data.forEach((transaction) => {
          const amount = parseFloat(transaction.transaction); // Ensure the amount is treated as a number

          totalAmount += amount;

          // Check the payment type and add the amount to the respective total
          if (transaction.payment_type === "Zelle") {
            zelleAmount += amount;
          } else if (transaction.payment_type === "Clover") {
            cloverAmount += amount;
          } else if (transaction.payment_type === "Cash") {
            cashAmount += amount;
          }
        });

        // Format the totals to two decimal places
        const formattedTotal = totalAmount.toFixed(2);
        const formattedZelle = zelleAmount.toFixed(2);
        const formattedClover = cloverAmount.toFixed(2);
        const formattedCash = cashAmount.toFixed(2);
        const calcular = document.getElementById("calculation");
        calcular.textContent = `Total hasta ahora es: $${formattedTotal} ($${formattedZelle} Zelle, $${formattedClover} Clover y $${formattedCash} Cash)`;
        calcular.style.display = "block"; // Make the calculation visible
        calcular.style.fontSize = "20px";
      }
    });
};

function createInput() {
  const container = document.createElement("div");
  container.style.gap = "10px";
  container.style.marginBottom = "10px";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Nombre";
  nameInput.required = true;

  const transactionInput = document.createElement("input");
  transactionInput.type = "number";
  transactionInput.placeholder = "Cantidad";
  transactionInput.required = true;
  transactionInput.min = 0;

  const paymentSelect = document.createElement("select");
  paymentSelect.style.width = "33%";
  paymentSelect.style.textAlign = "center";
  paymentSelect.style.marginTop = "20px";
  const options = ["Zelle", "Clover", "Cash"];
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.textContent = option;
    paymentSelect.appendChild(optionElement);
  });

  const doneButton = document.createElement("button");
  doneButton.textContent = "Agregar";
  doneButton.style.width = "33%";
  doneButton.style.marginTop = "20px";
  doneButton.onclick = () => {
    const name = nameInput.value;
    const transaction = transactionInput.value;
    const paymentType = paymentSelect.value;

    // Add the transaction to the database via POST request
    fetch("https://chain-just-parrot.glitch.me/add-entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        transaction,
        paymentType,
      }),
    })
      .then((response) => {
        if (response.ok) {
          isInputOpen = false;
          container.remove();
          fetchAndDisplayTransactions(); // Refresh the displayed transactions
        } else {
          alert("Error agregando esta transaccion.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error agregando esta transaccion.");
      });
  };

  const eliminateButton = document.createElement("button");
  eliminateButton.textContent = "X";
  eliminateButton.style.width = "15%";
  eliminateButton.style.backgroundColor = "#dc3545";
  eliminateButton.style.marginTop = "20px";
  eliminateButton.onclick = () => {
    // Add functionality to eliminate this entry from UI if necessary
    container.remove();
    isInputOpen = false;
  };

  container.appendChild(nameInput);
  container.appendChild(transactionInput);
  container.appendChild(paymentSelect);
  container.appendChild(doneButton);
  container.appendChild(eliminateButton);
  document.body.appendChild(container);
}

// Fetch and display transactions from the server
function fetchAndDisplayTransactions() {
  fetch("https://chain-just-parrot.glitch.me/transactions")
    .then((response) => response.json())
    .then((data) => {
      // Clear previous transactions
      const existingParagraphs = document.querySelectorAll(
        ".transaction-paragraph"
      );
      existingParagraphs.forEach((p) => p.remove());

      // Display each transaction as a paragraph
      data.forEach((transaction) => {
        const p = document.createElement("p");

        // Wrapping each category in <strong> to make it bold
        p.innerHTML = `
            <strong>Name:</strong> ${transaction.name}, 
            <strong>Amount:</strong> $${transaction.transaction}, 
            <strong>Metodo:</strong> ${transaction.payment_type}
          `;

        p.classList.add("transaction-paragraph");
        document.body.appendChild(p);

        // Add delete button to each transaction
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Borrar";

        deleteButton.onclick = () => {
          // Confirm deletion
          if (
            confirm(
              "¿Estás seguro de que quieres borrar esta transacción? Esto no se puede revertir."
            )
          ) {
            // Send DELETE request to the backend to remove the transaction
            fetch(`https://chain-just-parrot.glitch.me/delete-entry/${transaction.id}`, {
              method: "DELETE",
            })
              .then((response) => {
                if (response.ok) {
                  fetchAndDisplayTransactions(); // Refresh the displayed transactions
                } else {
                  alert("Error en borrar esta transaccion.");
                }
              })
              .catch((error) => {
                console.error("Error en borrar esta transaccion.", error);
                alert("Error en borrar esta transaccion.");
              });
          }
        };
        p.appendChild(deleteButton);
      });
    })
    .catch((error) => {
      console.error("Error obteniendo las transacciones.", error);
      alert("Error obteniendo las transacciones.");
    });
}

// Create the "Copy All Transactions" button
const copyButton = document.getElementById("copyButton");

// Function to copy all transaction text to the clipboard
copyButton.onclick = () => {
  fetch("https://chain-just-parrot.glitch.me/transactions")
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        showNotification("No hay transacciones para copiar!");
      } else {
        // Concatenate all transaction details into a single string
        const allTransactions = data
          .map(
            (transaction) =>
              `Nombre: ${transaction.name}, Cantidad: $${transaction.transaction}, Método: ${transaction.payment_type}`
          )
          .join("\n");

        const encodedTransactions = encodeURIComponent(allTransactions);
        window.location.href = `copiadojdeijdei.html?transactions=${encodedTransactions}`;
      }
    })
    .catch((error) => {
      console.error("Error obteniendo las transacciones.", error);
      alert("Error obteniendo las transacciones.");
    });
};




function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message; // Set the message
  notification.style.display = "block"; // Make it visible

  // Automatically hide after 3 seconds
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Fetch and display transactions when the page loads
window.onload = fetchAndDisplayTransactions;
