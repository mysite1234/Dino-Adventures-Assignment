const StatusBadge = ({ status }) => {
    const colors = {
      Pending: 'bg-amber-100 text-amber-800 border-amber-200',
      Approved: 'bg-green-100 text-green-800 border-green-200',
      Cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
  
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded border ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };
  
  export default StatusBadge;