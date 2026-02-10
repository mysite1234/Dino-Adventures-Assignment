const PaymentBadge = ({ status }) => {
    const colors = {
      Paid: 'bg-green-100 text-green-800 border-green-200',
      Partial: 'bg-blue-100 text-blue-800 border-blue-200',
      Pending: 'bg-amber-100 text-amber-800 border-amber-200'
    };
  
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded border ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };
  
  export default PaymentBadge;