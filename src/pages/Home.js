import React, { useState, useEffect } from "react";
import "./Home.css";
import svg from "../assets/icons/user(1).svg";
import Todo from "../assets/icons/To-do.svg";
import InProgressIcon from "../assets/icons/in-progress.svg";
import DoneIcon from "../assets/icons/Done.svg";
import CancelledIcon from "../assets/icons/Cancelled.svg";
import BacklogIcon from "../assets/icons/Backlog.svg";
import add from "../assets/icons/add.svg";
import threedots from "../assets/icons/3 dot menu.svg";
import Display from "../assets/icons/Display.svg";
import ddown from "../assets/icons/ddown.svg";

// Priority Icons
import NoPriorityIcon from "../assets/icons/No-priority.svg";
import LowPriorityIcon from "../assets/icons/Img - Low Priority.svg";
import MediumPriorityIcon from "../assets/icons/Img - Medium Priority.svg";
import HighPriorityIcon from "../assets/icons/Img - High Priority.svg";
import UrgentPriorityIcon from "../assets/icons/SVG - Urgent Priority grey.svg";

const statusIcons = {
  Backlog: BacklogIcon,
  Todo: Todo,
  InProgress: InProgressIcon,
  Done: DoneIcon,
  Canceled: CancelledIcon,
};

const priorityIcons = {
  0: NoPriorityIcon,
  1: LowPriorityIcon,
  2: MediumPriorityIcon,
  3: HighPriorityIcon,
  4: UrgentPriorityIcon,
};

const priorityGroupMap = {
  NoPriority: 0,
  Low: 1,
  Medium: 2,
  High: 3,
  Urgent: 4,
};

const Home = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState(
    () => localStorage.getItem("grouping") || "Status"
  );
  const [ordering, setOrdering] = useState(
    () => localStorage.getItem("ordering") || "Priority"
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState(null);

  useEffect(() => {
    fetch("https://api.quicksell.co/v1/internal/frontend-assignment")
      .then((response) => response.json())
      .then((data) => {
        setTickets(data.tickets);
        setUsers(data.users);
      })
      .catch((error) => console.log("Error fetching data :", error));
  }, []);

  useEffect(() => {
    localStorage.setItem("grouping", grouping);
  }, [grouping]);

  useEffect(() => {
    localStorage.setItem("ordering", ordering);
  }, [ordering]);

  const groupTickets = (tickets) => {
    switch (grouping) {
      case "User":
        return groupByUser(tickets, users);
      case "Priority":
        return groupByPriority(tickets);
      case "Status":
      default:
        return groupByStatus(tickets);
    }
  };

  const sortTickets = (tickets) => {
    switch (ordering) {
      case "Title":
        return tickets.sort((a, b) => a.title.localeCompare(b.title));
      case "Priority":
      default:
        return tickets.sort((a, b) => b.priority - a.priority);
    }
  };

  const groupByStatus = (tickets) => {
    return {
      Backlog: tickets.filter((ticket) => ticket.status === "Backlog"),
      Todo: tickets.filter((ticket) => ticket.status === "Todo"),
      InProgress: tickets.filter((ticket) => ticket.status === "In progress"),
      Done: tickets.filter((ticket) => ticket.status === "Done"),
      Canceled: tickets.filter((ticket) => ticket.status === "Canceled"),
    };
  };

  const groupByUser = (tickets, users) => {
    const groupedByUser = {};
    users.forEach((user) => {
      groupedByUser[user.name] = tickets.filter(
        (ticket) => ticket.userId === user.id
      );
    });
    return groupedByUser;
  };

  const groupByPriority = (tickets) => {
    return {
      NoPriority: tickets.filter((ticket) => ticket.priority === 0),
      Low: tickets.filter((ticket) => ticket.priority === 1),
      Medium: tickets.filter((ticket) => ticket.priority === 2),
      High: tickets.filter((ticket) => ticket.priority === 3),
      Urgent: tickets.filter((ticket) => ticket.priority === 4),
    };
  };

  const handleDrop = (newGroup, ticketId, type) => {
    setTickets((prevTickets) => {
      const updatedTickets = prevTickets.map((ticket) => {
        if (ticket.id === ticketId) {
          if (type === "status") return { ...ticket, status: newGroup };
          if (type === "user") {
            const selectedUser = users.find((user) => user.name === newGroup);
            return { ...ticket, userId: selectedUser.id };
          }
          if (type === "priority") {
            return { ...ticket, priority: newGroup };
          }
        }
        return ticket;
      });

      return updatedTickets;
    });
    setDraggedTicket(null);
  };

  const groupedTickets = groupTickets(sortTickets(tickets));

  return (
    <div className="home-container">
      <div className="icon-dropdown">
        <span
          onClick={() => setShowDropdown(!showDropdown)}
          className="dropdown-trigger"
        >
          <img src={Display} alt="display" />
          Display
          <img src={ddown} alt="" />
        </span>
        {showDropdown && (
          <div className="dropdown-menu">
            <div className="dropdown-row">
              <div className="dropdown-grouping">
                <label>Grouping</label>
                <select
                  value={grouping}
                  onChange={(e) => setGrouping(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="Status">Status</option>
                  <option value="User">User</option>
                  <option value="Priority">Priority</option>
                </select>
              </div>
              <div className="dropdown-ordering">
                <label>Ordering</label>
                <select
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="Priority">Priority</option>
                  <option value="Title">Title</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="kanban-board">
        {Object.keys(groupedTickets).map((group) => (
          <KanbanColumn
            key={group}
            title={group}
            tickets={groupedTickets[group]}
            users={users}
            onDropCard={(newGroup, ticketId) =>
              handleDrop(newGroup, ticketId, grouping.toLowerCase())
            }
            setDraggedTicket={setDraggedTicket}
            draggedTicket={draggedTicket}
            icon={
              grouping === "Status"
                ? statusIcons[group]
                : grouping === "Priority"
                ? priorityIcons[priorityGroupMap[group]]
                : grouping === "User"
                ? svg
                : null
            }
            grouping={grouping}
          />
        ))}
      </div>
    </div>
  );
};

const KanbanColumn = ({
  title,
  tickets,
  users,
  onDropCard,
  setDraggedTicket,
  draggedTicket,
  icon,
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedTicket) {
      onDropCard(title, draggedTicket.id);
    }
  };

  return (
    <div
      className="kanban-column"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="column-header">
        {icon && (
          <img src={icon} alt={`${title} icon`} className="status-icon" />
        )}
        <h3>{title}</h3>
        <span className="column-header-span">{tickets.length}</span>
        <span className="column-header-add">
          <img src={add} alt="" />
          <img src={threedots} alt="" />
        </span>
      </div>
      {tickets.length > 0 ? (
        tickets.map((ticket) => (
          <KanbanCard
            key={ticket.id}
            ticket={ticket}
            users={users}
            title={title}
            icon={icon}
            setDraggedTicket={setDraggedTicket}
          />
        ))
      ) : (
        <p></p>
      )}
    </div>
  );
};

const KanbanCard = ({ ticket, users, setDraggedTicket, icon }) => {
  const handleDragStart = () => {
    setDraggedTicket(ticket);
  };

  return (
    <div className="kanban-card" draggable onDragStart={handleDragStart}>
      <div className="card-header">
        <span className="ticket-id">{ticket.id}</span>
        <img src={svg} alt="userImg" className="assignee-avatar" />
      </div>
      {/* {icon && (
        <img src={icon} alt={`${ticket.title} icon`} className="status-icons" />
      )} */}

      <h4 className="ticket-title">{ticket.title}</h4>
      <div className="card-tags">
        <span className="priority-icon">
          <img
            src={priorityIcons[ticket.priority]}
            alt="Priority Icon"
            className="priority-icon"
          />
        </span>
        <span>{ticket.tag[0]}</span>
      </div>
    </div>
  );
};

export default Home;
