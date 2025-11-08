import React, { useState } from 'react';

const fmt = n => Number.isFinite(n) ? n.toFixed(2) : '0.00';

function NewItemRow({ onAdd }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  function submit(e) {
    e.preventDefault();
    const p = parseFloat(price);
    if (!name || Number.isNaN(p) || p < 0) return;
    onAdd({ name: name.trim(), price: p });
    setName('');
    setPrice('');
  }

  return (
    <form onSubmit={submit} className='flex gap-2 mt-2 justify-center '>
      <input className='border border-neutral-200 rounded px-2 bg-white w-32 md:w-50' placeholder="Item name" value={name} onChange={e => setName(e.target.value)} />
      <input className='border border-neutral-200 rounded px-2 bg-white w-32 md:w-50' placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
      <button className='border border-neutral-200 rounded px-2 cursor-pointer bg-gray-300' type="submit">Add</button>
    </form>
  );
}

function ParticipantCard({ person, onAddItem, onRemoveItem, onRemovePerson }) {
  return (
    <div className='border border-neutral-200 rounded mb-3 p-3 bg-gray-100 shadow-lg'>
      <div className='flex justify-between items-center'>
        <strong>{person.name}</strong>
        <button onClick={() => onRemovePerson(person.id)} className='text-red-600 cursor-pointer'>Remove Person</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <div className='text-gray-600'>Items:</div>
        {person.items.length === 0 && <div className='text-gray-500 text-center font-bold mb-1'>No items yet</div>}
        <ul className='px-7'>
          {person.items.map((it, i) => (
            <li key={i} className='flex justify-between'>
              <span>{it.name}</span>
              <div>
                <span className='me-5'>{fmt(it.price)} </span>
                <button onClick={() => onRemoveItem(person.id, i)} className='text-red-600 cursor-pointer'>Remove</button>
              </div>
            </li>
          ))}
        </ul>
        <NewItemRow onAdd={item => onAddItem(person.id, item)} />
      </div>
    </div>
  );
}

export default function App() {
  const [totalBill, setTotalBill] = useState('');
  const [taxPercent, setTaxPercent] = useState('1');
  const [servicePercent, setServicePercent] = useState('5');
  const [participants, setParticipants] = useState([]);
  const [personName, setPersonName] = useState('');

  function addPerson() {
    if (!personName.trim()) return;
    setParticipants(prev => [...prev, { id: Date.now(), name: personName.trim(), items: [] }]);
    setPersonName('');
  }

  function addItemToPerson(id, item) {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, items: [...p.items, item] } : p));
  }

  function removeItemFromPerson(id, index) {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, items: p.items.filter((_, i) => i !== index) } : p));
  }

  function removePerson(id) {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }

  function calculate() {
    const subtotal = participants.reduce((s, p) => s + p.items.reduce((x, it) => x + (Number(it.price) || 0), 0), 0);
    const total = parseFloat(totalBill) || subtotal;
    const tax = parseFloat(taxPercent) || 0;
    const service = parseFloat(servicePercent) || 0;

    if (subtotal === 0) return [];

    return participants.map(p => {
      const personSubtotal = p.items.reduce((x, it) => x + (Number(it.price) || 0), 0);
      const ratio = personSubtotal / subtotal;
      const taxShare = (total * (tax / 100)) * ratio;
      const serviceShare = (total * (service / 100)) * ratio;
      const grandTotal = personSubtotal + taxShare + serviceShare;

      return { ...p, personSubtotal, taxShare, serviceShare, grandTotal };
    });
  }

  const results = calculate();

  return (
    <div className="m-auto p-5 max-w-4xl container border border-neutral-200 rounded my-[5%] bg-gray-50 shadow-2xl overflow-hidden ">
      <h1 className="text-4xl mb-5 text-center font-bold tracking-wider">RECEIPT</h1>

      <div className='border border-neutral-200 rounded p-3 flex justify-center gap-3'>
        <label>Tax %</label>
        <input
          className='border border-neutral-200 rounded mx-2 px-2 w-25 md:w-l'
          value={taxPercent}
          onChange={(e) => setTaxPercent(e.target.value)}
        />
        <label>Service %</label>
        <input
          className='border border-neutral-200 rounded mx-2 px-2 w-25 md:w-l'
          value={servicePercent}
          onChange={(e) => setServicePercent(e.target.value)}
        />
      </div>

      <div className='mt-5 mb-5'>
        <h3 className='text-center text-gray-700 font-bold text-2xl'>Participants : </h3>
        <div className='flex justify-center gap-2 my-3'>
          <input
            className="border border-neutral-200 rounded px-2"
            placeholder="Person Name.."
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
          />
          <button onClick={addPerson} className='border border-neutral-200 rounded px-2 cursor-pointer bg-gray-300'>Add</button>
        </div>

        {participants.map((p) => (
          <ParticipantCard
            key={p.id}
            person={p}
            onAddItem={addItemToPerson}
            onRemoveItem={removeItemFromPerson}
            onRemovePerson={removePerson}
          />
        ))}
      </div>

      <h3 className='font-bold text-center text-2xl mb-3 text-gray-600'>Results :</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr className='border-b border-gray-200 text-gray-800'>
            <th>Name</th>
            <th>Items Total</th>
            <th>Tax</th>
            <th>Service</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id} className='border-b border-gray-200 text-center'>
              <td>{r.name}</td>
              <td>{fmt(r.personSubtotal)}</td>
              <td>{fmt(r.taxShare)}</td>
              <td>{fmt(r.serviceShare)}</td>
              <td>
                <strong>{fmt(r.grandTotal)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
