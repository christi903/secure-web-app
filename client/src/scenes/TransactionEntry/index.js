

import React, { useState } from "react";

const TransactionEntry = () => {
  const [form, setForm] = useState({
    initiatorId: "",
    transactionType: "",
    transactionAmount: "",
    recipientId: "",
    oldInitiatorBalance: "",
    newInitiatorBalance: "",
    oldRecipientBalance: "",
    newRecipientBalance: "",
    transactionDateTime: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can handle the form submission here (e.g., send data to backend or ML model)
    console.log(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <div>
        <label>Initiator ID</label>
        <input
          type="text"
          name="initiatorId"
          value={form.initiatorId}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Transaction Type</label>
        <input
          type="text"
          name="transactionType"
          value={form.transactionType}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Transaction Amount</label>
        <input
          type="number"
          name="transactionAmount"
          value={form.transactionAmount}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Recipient ID</label>
        <input
          type="text"
          name="recipientId"
          value={form.recipientId}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Old Initiator Balance</label>
        <input
          type="number"
          name="oldInitiatorBalance"
          value={form.oldInitiatorBalance}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>New Initiator Balance</label>
        <input
          type="number"
          name="newInitiatorBalance"
          value={form.newInitiatorBalance}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Old Recipient Balance</label>
        <input
          type="number"
          name="oldRecipientBalance"
          value={form.oldRecipientBalance}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>New Recipient Balance</label>
        <input
          type="number"
          name="newRecipientBalance"
          value={form.newRecipientBalance}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Transaction Date and Time</label>
        <input
          type="datetime-local"
          name="transactionDateTime"
          value={form.transactionDateTime}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" style={{ marginTop: 16 }}>Submit</button>
    </form>
  );
};

export default TransactionEntry;