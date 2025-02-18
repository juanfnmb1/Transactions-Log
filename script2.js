let isInputOpen = false;
const doneButton1 = document.createElement("button");
doneButton1.id = "eliminarTodo";
doneButton1.textContent = "Eliminar Todo";
doneButton1.style.backgroundColor = "#dc3545";
doneButton1.style.marginTop = "15px";
doneButton1.onclick = () => {
  fetch("https://chain-just-parrot.glitch.me/debts")
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        alert("No hay deudas para eliminar.");
      } else {
        if (
          confirm(
            "¿Estás seguro de que quieres borrar todas las deudas? Esto no se puede revertir."
          )
        ) {
          fetch("https://chain-just-parrot.glitch.me/delete-all-debts", {
            method: "DELETE",
          })
            .then((response) => {
              if (response.ok) {
                fetchAndDisplayDebts(); // Refresh the displayed transactions
              } else {
                alert("Error borrando las deudas.");
              }
            })
            .catch((error) => {
              console.error("Error borrando las deudas.", error);
              alert("Error borrando las deudas.");
            });
        }
      }
    })
    .catch((error) => {
      console.error("Error obteniendo estas transacciones.", error);
      alert("Error obteniendo estas transacciones.");
    });
};

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
const lineBreak = document.createElement("br");
const newEntryContainer = document.getElementById("container");
newEntryContainer.appendChild(lineBreak);
newEntryContainer.appendChild(doneButton1);
const calculateButton = document.createElement("button");
calculateButton.textContent = "Calcular Total";
calculateButton.style.backgroundColor = "black";
calculateButton.style.width = "45%";
calculateButton.style.marginTop = "15px";

newEntryContainer.appendChild(calculateButton);

calculateButton.onclick = () => {
  fetch("https://chain-just-parrot.glitch.me/debts")
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        const calcular = document.getElementById("calculation");
        calcular.textContent = `Total de deudas es: $0`; // Use totalAmount instead of amount
        calcular.style.display = "block"; // Make the calculation visible
        calcular.style.fontSize = "20px";
      } else {
        let totalAmount = 0;

        // Loop through the data and sum the amounts
        data.forEach((transaction) => {
          const amount = parseFloat(transaction.amount); // Ensure the amount is treated as a number
          totalAmount += amount;
        });

        const calcular = document.getElementById("calculation");
        calcular.textContent = `Total de deudas es: $${totalAmount.toFixed(2)}`; // Use totalAmount instead of amount
        calcular.style.display = "block"; // Make the calculation visible
        calcular.style.fontSize = "20px";
      }
    })
    .catch((error) => {
      console.error("Error obteniendo las deudas.", error);
      alert("Error obteniendo las deudas.");
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

  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.placeholder = "Cantidad";
  amountInput.required = true;
  amountInput.min = 0;

  const descriptionInput = document.createElement("input"); // New input for description
  descriptionInput.type = "text";
  descriptionInput.style.width = "47%";
  descriptionInput.placeholder = "¿Qué hizo?";
  descriptionInput.required = true;

  const doneButton = document.createElement("button");
  doneButton.textContent = "Agregar";
  doneButton.style.width = "30%";
  doneButton.style.marginTop = "20px";
  doneButton.onclick = () => {
    const name = nameInput.value;
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value; // Get description
    isInputOpen = false;

    fetch("https://chain-just-parrot.glitch.me/add-debt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        amount,
        description, // Send description too
      }),
    })
      .then((response) => {
        if (response.ok) {
          isInputOpen = false;
          container.remove();
          fetchAndDisplayDebts(); // Refresh the displayed transactions
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
  eliminateButton.style.marginLeft = "0";
  eliminateButton.style.width = "15%";
  eliminateButton.style.backgroundColor = "#dc3545";
  eliminateButton.style.marginTop = "20px";
  eliminateButton.onclick = () => {
    container.remove();
    isInputOpen = false;
  };

  container.appendChild(nameInput);
  container.appendChild(amountInput);
  container.appendChild(descriptionInput); // Append description input
  container.appendChild(doneButton);
  container.appendChild(eliminateButton);
  document.body.appendChild(container);
}

function fetchAndDisplayDebts() {
  fetch("https://chain-just-parrot.glitch.me/debts")
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
                <strong>Amount:</strong> $${transaction.amount}, 
                <strong>Descripcion:</strong> ${transaction.description} <!-- Add item field -->
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
              "¿Estás seguro de que quieres borrar esta deuda? Esto no se puede revertir."
            )
          ) {
            // Send DELETE request to the backend to remove the transaction
            fetch(`https://chain-just-parrot.glitch.me/delete-debt/${transaction.id}`, {
              method: "DELETE",
            })
              .then((response) => {
                if (response.ok) {
                  fetchAndDisplayDebts(); // Refresh the displayed transactions
                } else {
                  alert("Error en borrar esta deuda.");
                }
              })
              .catch((error) => {
                console.error("Error en borrar esta deuda.", error);
                alert("Error en borrar esta deuda.");
              });
          }
        };
        p.appendChild(deleteButton);
      });
    })
    .catch((error) => {
      console.error("Error obteniendo las deudas.", error);
      alert("Error obteniendo las deudas.");
    });
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message; // Set the message
  notification.style.display = "block"; // Make it visible

  // Automatically hide after 3 seconds
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

const copyButton = document.getElementById("copyButton");

// Function to copy all transaction text to the clipboard
copyButton.onclick = () => {
  fetch("https://chain-just-parrot.glitch.me/debts")
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        showNotification("No hay deudas para copiar!");
      } else {
        // Concatenate all transaction details into a single string
        const allTransactions = data
          .map(
            (transaction) =>
              `Nombre: ${transaction.name}, Cantidad: $${transaction.amount}, Descripción: ${transaction.description}`
          )
          .join("\n");

        // Redirect to copiado2.html with transactions as a query parameter
        const encodedTransactions = encodeURIComponent(allTransactions);
        window.location.href = `copiado2dijwiw.html?transactions=${encodedTransactions}`;
      }
    })
    .catch((error) => {
      console.error("Error obteniendo las transacciones.", error);
      alert("Error obteniendo las transacciones.");
    });
};

window.onload = fetchAndDisplayDebts;

