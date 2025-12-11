import React, { useState } from 'react';
import { Plus, Download, Mail, CheckCircle, Trash2, Edit2, X, PlusCircle, MinusCircle, Repeat, Play, PauseCircle, CalendarClock, Save } from 'lucide-react';
import { Invoice, InvoiceItem, RecurringInvoice, Frequency, SavedItem } from '../types';
import { MOCK_INVOICES, MOCK_RECURRING_INVOICES, MOCK_SAVED_ITEMS } from '../services/mockDataService';
import { logAuditAction } from '../services/auditService';
import { getCurrentUser } from '../services/authService';

const Invoices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'recurring'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>(MOCK_RECURRING_INVOICES);
  const [savedItems, setSavedItems] = useState<SavedItem[]>(MOCK_SAVED_ITEMS);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [formType, setFormType] = useState<'one-time' | 'recurring'>('one-time');
  const [formData, setFormData] = useState<{
    clientName: string;
    clientEmail: string;
    issueDate: string; // Used for one-time
    dueDate: string;   // Used for one-time
    nextRunDate: string; // Used for recurring
    frequency: Frequency;
    items: InvoiceItem[];
    status: 'DRAFT' | 'SENT' | 'PAID';
    notes: string;
    taxRate: number;
    discount: number;
    terms: string;
  }>({
    clientName: '',
    clientEmail: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    nextRunDate: new Date().toISOString().split('T')[0],
    frequency: Frequency.MONTHLY,
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, amount: 0 }],
    status: 'DRAFT',
    notes: '',
    taxRate: 0,
    discount: 0,
    terms: 'Net 30. Please make checks payable to IntelliLedger Inc.'
  });

  // --- ACTIONS: Standard Invoices ---
  const handleStatusChange = (id: string, newStatus: 'DRAFT' | 'SENT' | 'PAID') => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    const user = getCurrentUser();
    if (user) logAuditAction(user, 'UPDATE', `INVOICE:${id} -> ${newStatus}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
      const user = getCurrentUser();
      if (user) logAuditAction(user, 'DELETE', `INVOICE:${id}`);
    }
  };

  // --- ACTIONS: Recurring Invoices ---
  const handleToggleRecurringStatus = (id: string) => {
    setRecurringInvoices(recurringInvoices.map(inv => 
      inv.id === id ? { ...inv, status: inv.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : inv
    ));
    const user = getCurrentUser();
    if (user) logAuditAction(user, 'UPDATE', `RECURRING_TEMPLATE:${id}`);
  };

  const handleDeleteRecurring = (id: string) => {
    if (confirm('Are you sure you want to delete this recurring template?')) {
      setRecurringInvoices(recurringInvoices.filter(inv => inv.id !== id));
      const user = getCurrentUser();
      if (user) logAuditAction(user, 'DELETE', `RECURRING_TEMPLATE:${id}`);
    }
  };

  const handleRunNow = (template: RecurringInvoice) => {
    if (confirm(`Generate an invoice for ${template.clientName} now?`)) {
      const newInv: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        clientName: template.clientName,
        clientEmail: template.clientEmail,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days rough calc
        amount: template.amount,
        status: 'DRAFT',
        items: [...template.items], // Clone items
        taxRate: template.taxRate,
        discount: template.discount,
        terms: template.terms,
        notes: template.notes
      };
      setInvoices([newInv, ...invoices]);
      setActiveTab('invoices');
      const user = getCurrentUser();
      if (user) logAuditAction(user, 'CREATE', `INVOICE:${newInv.id} (From Template)`);
      alert('Invoice generated successfully!');
    }
  };

  // --- FORM CALCULATIONS ---
  const calculateSubtotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotals = () => {
    const subtotal = calculateSubtotal(formData.items || []);
    const discount = formData.discount || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxAmount = taxableAmount * ((formData.taxRate || 0) / 100);
    const total = taxableAmount + taxAmount;
    
    return { subtotal, discount, taxAmount, total };
  };

  const handleAddItem = () => {
    const items = formData.items || [];
    setFormData({
      ...formData,
      items: [...items, { id: Math.random().toString(), description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    });
  };

  const handleRemoveItem = (itemId: string) => {
    const items = formData.items || [];
    if (items.length > 1) {
      const updatedItems = items.filter(i => i.id !== itemId);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    const items = formData.items || [];
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
        }
        return updatedItem;
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  // --- SAVED ITEMS LOGIC ---
  const handleApplySavedItem = (savedItemId: string, lineItemId: string) => {
    const itemTemplate = savedItems.find(i => i.id === savedItemId);
    if (!itemTemplate) return;

    const items = formData.items || [];
    const updatedItems = items.map(item => {
      if (item.id === lineItemId) {
        return { 
           ...item, 
           description: itemTemplate.description, 
           unitPrice: itemTemplate.unitPrice,
           amount: item.quantity * itemTemplate.unitPrice 
        };
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSaveItemToLibrary = (lineItem: InvoiceItem) => {
    if (!lineItem.description) return alert('Description is required to save an item.');
    
    if (savedItems.some(i => i.description === lineItem.description)) {
        return alert('Item with this description already exists in library.');
    }

    const newItem: SavedItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: lineItem.description.split(' ').slice(0, 3).join(' ') + (lineItem.description.length > 20 ? '...' : ''),
        description: lineItem.description,
        unitPrice: lineItem.unitPrice
    };
    setSavedItems([...savedItems, newItem]);
    alert('Item saved to library!');
  };

  const handleSave = (status?: 'DRAFT' | 'SENT') => {
    if (!formData.clientName) return alert('Client Name is required');
    const { total } = calculateTotals();
    const user = getCurrentUser();

    if (formType === 'recurring') {
      const newRecurring: RecurringInvoice = {
        id: Math.random().toString(36).substr(2, 9),
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        frequency: formData.frequency,
        nextRunDate: formData.nextRunDate,
        amount: total,
        status: 'ACTIVE',
        items: formData.items,
        notes: formData.notes,
        taxRate: formData.taxRate,
        discount: formData.discount,
        terms: formData.terms
      };
      setRecurringInvoices([newRecurring, ...recurringInvoices]);
      setActiveTab('recurring');
      if (user) logAuditAction(user, 'CREATE', `RECURRING_TEMPLATE:${newRecurring.id}`);
    } else {
       if (!formData.dueDate) return alert('Due Date is required for one-time invoices');
       const newInv: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        amount: total,
        status: status || 'DRAFT',
        items: formData.items,
        notes: formData.notes,
        taxRate: formData.taxRate,
        discount: formData.discount,
        terms: formData.terms
      };
      setInvoices([newInv, ...invoices]);
      setActiveTab('invoices');
      if (user) logAuditAction(user, 'CREATE', `INVOICE:${newInv.id}`);
    }

    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      nextRunDate: new Date().toISOString().split('T')[0],
      frequency: Frequency.MONTHLY,
      items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, amount: 0 }],
      status: 'DRAFT',
      notes: '',
      taxRate: 0,
      discount: 0,
      terms: 'Net 30. Please make checks payable to IntelliLedger Inc.'
    });
    setFormType('one-time');
  };

  const openCreateModal = () => {
    resetForm();
    // Pre-set the form type based on current tab, but allow user to change
    setFormType(activeTab === 'recurring' ? 'recurring' : 'one-time');
    setIsCreating(true);
  };

  // --- RENDER FORM ---
  if (isCreating) {
    const { subtotal, discount, taxAmount, total } = calculateTotals();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-slate-800">
                {formType === 'recurring' ? 'New Recurring Template' : 'New Invoice'}
            </h2>
            <button 
                onClick={() => setIsCreating(false)}
                className="text-slate-500 hover:text-slate-800"
            >
                <X size={24} />
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
            
            {/* Type Toggle */}
            <div className="flex justify-center mb-6">
                <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                    <button 
                        onClick={() => setFormType('one-time')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            formType === 'one-time' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        One-time Invoice
                    </button>
                    <button 
                         onClick={() => setFormType('recurring')}
                         className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                            formType === 'recurring' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Repeat size={14} /> Recurring Template
                    </button>
                </div>
            </div>

            {/* Client & Date Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
                    <input 
                        type="text" 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Acme Corp"
                        value={formData.clientName}
                        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client Email</label>
                    <input 
                        type="email" 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="billing@acme.com"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                    />
                </div>

                {formType === 'one-time' ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date *</label>
                            <input 
                                type="date" 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.issueDate}
                                onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
                            <input 
                                type="date" 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Frequency *</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.frequency}
                                onChange={(e) => setFormData({...formData, frequency: e.target.value as Frequency})}
                            >
                                {Object.values(Frequency).map(freq => (
                                    <option key={freq} value={freq}>{freq}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Next Run Date *</label>
                            <input 
                                type="date" 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.nextRunDate}
                                onChange={(e) => setFormData({...formData, nextRunDate: e.target.value})}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Line Items */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Line Items</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-sm font-medium text-slate-600 w-40">Load Product</th>
                                <th className="px-4 py-2 text-sm font-medium text-slate-600">Description</th>
                                <th className="px-4 py-2 text-sm font-medium text-slate-600 w-24">Qty</th>
                                <th className="px-4 py-2 text-sm font-medium text-slate-600 w-32">Price</th>
                                <th className="px-4 py-2 text-sm font-medium text-slate-600 w-32">Total</th>
                                <th className="px-4 py-2 w-24 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {formData.items?.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2">
                                        <select 
                                            className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none py-1 text-sm text-slate-600 cursor-pointer"
                                            onChange={(e) => handleApplySavedItem(e.target.value, item.id)}
                                            value=""
                                        >
                                            <option value="" disabled>Select...</option>
                                            {savedItems.map(si => (
                                                <option key={si.id} value={si.id}>{si.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="text" 
                                            className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none py-1"
                                            placeholder="Item description"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="number" 
                                            className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none py-1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="number" 
                                            className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none py-1"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value))}
                                        />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-slate-700">
                                        ${item.amount.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button 
                                                onClick={() => handleSaveItemToLibrary(item)}
                                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                                                title="Save Item to Library"
                                            >
                                                <Save size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                                title="Remove Line Item"
                                            >
                                                <MinusCircle size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button 
                    onClick={handleAddItem}
                    className="mt-4 flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    <PlusCircle size={16} />
                    <span>Add Item</span>
                </button>
            </div>

            {/* Footer Summary & Terms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Terms & Conditions</label>
                        <textarea 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-32 text-sm"
                            placeholder="e.g. Net 30. Please make checks payable to..."
                            value={formData.terms}
                            onChange={(e) => setFormData({...formData, terms: e.target.value})}
                        />
                    </div>
                </div>
                
                <div className="space-y-3 lg:w-80 lg:ml-auto">
                    <div className="flex justify-between items-center text-slate-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-2">Discount ($)</span>
                        <input 
                            type="number"
                            className="w-24 border border-slate-200 rounded px-2 py-1 text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.discount}
                            onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                        />
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-2">Tax Rate (%)</span>
                        <div className="flex items-center justify-end gap-2">
                            <input 
                                type="number"
                                className="w-16 border border-slate-200 rounded px-2 py-1 text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.taxRate}
                                onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                            />
                            <span className="w-16 text-right">${taxAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold text-slate-800 pt-3 border-t border-slate-200">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
                <button 
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                {formType === 'one-time' ? (
                    <>
                        <button 
                            onClick={() => handleSave('DRAFT')}
                            className="px-6 py-2 border border-slate-300 bg-slate-100 rounded-lg text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                        >
                            Save Draft
                        </button>
                        <button 
                            onClick={() => handleSave('SENT')}
                            className="px-6 py-2 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 shadow-md transition-colors"
                        >
                            Generate & Send
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => handleSave()}
                        className="px-6 py-2 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 shadow-md transition-colors"
                    >
                        Save Recurring Template
                    </button>
                )}
            </div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Invoices</h2>
            <p className="text-slate-500">Manage client billing and recurring schedules.</p>
        </div>
        <button 
            onClick={openCreateModal}
            className="flex items-center space-x-2 bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
        >
            <Plus size={18} />
            <span>Create Invoice</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200">
        <button 
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'invoices' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            All Invoices
        </button>
        <button 
            onClick={() => setActiveTab('recurring')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'recurring' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            Recurring Templates
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'invoices' ? (
            // --- ONE-TIME INVOICES TABLE ---
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Client</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Dates</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {invoices.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No invoices found.</td></tr>
                    ) : (
                        invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{inv.clientName}</div>
                                    <div className="text-xs text-slate-500">{inv.clientEmail}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-800">Due: {inv.dueDate}</div>
                                    <div className="text-xs text-slate-500">Issued: {inv.issueDate}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    {(inv.taxRate || 0) > 0 && <div className="text-xs text-slate-500">Inc. {inv.taxRate}% Tax</div>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                                        inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {inv.status === 'PAID' && <CheckCircle size={12} className="mr-1" />}
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        {inv.status === 'DRAFT' && (
                                            <button 
                                                onClick={() => handleStatusChange(inv.id, 'SENT')}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                                                title="Mark Sent"
                                            >
                                                <Mail size={18} />
                                            </button>
                                        )}
                                        {inv.status === 'SENT' && (
                                            <button 
                                                onClick={() => handleStatusChange(inv.id, 'PAID')}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded" 
                                                title="Mark Paid"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        <button className="p-1 text-slate-400 hover:text-slate-600 rounded" title="Download PDF">
                                            <Download size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(inv.id)}
                                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        ) : (
            // --- RECURRING TEMPLATES TABLE ---
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Client</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Frequency</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Next Run</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {recurringInvoices.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No recurring templates found.</td></tr>
                    ) : (
                        recurringInvoices.map(rec => (
                            <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{rec.clientName}</div>
                                    <div className="text-xs text-slate-500">{rec.clientEmail}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-slate-700">
                                        <Repeat size={14} className="mr-2 text-indigo-500" />
                                        {rec.frequency}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-800">{rec.nextRunDate}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">${rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        rec.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {rec.status === 'ACTIVE' ? 'Active' : 'Paused'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button 
                                            onClick={() => handleRunNow(rec)}
                                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded" 
                                            title="Run Now"
                                        >
                                            <Play size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleRecurringStatus(rec.id)}
                                            className={`p-1 rounded ${rec.status === 'ACTIVE' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                                            title={rec.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                                        >
                                            {rec.status === 'ACTIVE' ? <PauseCircle size={18} /> : <CalendarClock size={18} />}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteRecurring(rec.id)}
                                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default Invoices;