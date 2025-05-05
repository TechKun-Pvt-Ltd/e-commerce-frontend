"use client";

import { useState } from "react";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: "open" | "in-progress" | "closed";
  createdAt: string;
}

export default function SupportTickets() {
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "1",
      subject: "Order Delay",
      description: "My order hasn't arrived yet",
      status: "open",
      createdAt: "2024-01-20"
    }
  ]);

  const handleSubmitTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTicket: Ticket = {
      id: String(Date.now()),
      subject: formData.get("subject") as string,
      description: formData.get("description") as string,
      status: "open",
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTickets([newTicket, ...tickets]);
    setShowTicketForm(false);
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Support Tickets</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
      </div>

      {!showTicketForm ? (
        <button
          onClick={() => setShowTicketForm(true)}
          className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-700 hover:border-gray-800 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
        >
          <span className="flex items-center justify-center space-x-2">
            <span className="text-xl">+</span>
            <span>Create New Support Ticket</span>
          </span>
        </button>
      ) : (
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">New Support Ticket</h3>
            <button
              onClick={() => setShowTicketForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Submit Ticket
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                <p className="text-sm text-gray-500">{ticket.createdAt}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            <p className="text-gray-700">{ticket.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}