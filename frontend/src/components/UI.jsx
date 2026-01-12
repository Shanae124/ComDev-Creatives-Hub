import '@/styles/index.css';

export const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">📚 ProtexxaLearn</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-gray-700">{user.name}</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {user.role}
                </span>
                <button
                  onClick={onLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Sidebar = ({ role, active, onNavClick }) => {
  const studentItems = [
    { id: 'courses', label: '📖 My Courses', icon: '📖' },
    { id: 'progress', label: '📊 Progress', icon: '📊' },
    { id: 'assignments', label: '✏️ Assignments', icon: '✏️' },
    { id: 'grades', label: '⭐ Grades', icon: '⭐' },
  ];

  const instructorItems = [
    { id: 'courses', label: '📖 My Courses', icon: '📖' },
    { id: 'create-course', label: '➕ Create Course', icon: '➕' },
    { id: 'students', label: '👥 Students', icon: '👥' },
    { id: 'grading', label: '📝 Grading', icon: '📝' },
  ];

  const adminItems = [
    { id: 'courses', label: '📖 All Courses', icon: '📖' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'analytics', label: '📊 Analytics', icon: '📊' },
  ];

  const items = role === 'admin' ? adminItems : role === 'instructor' ? instructorItems : studentItems;

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-8">Menu</h2>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavClick(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
              active === item.id
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
};

export const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>}
      {children}
    </div>
  );
};

export const Button = ({ onClick, children, variant = 'primary', disabled = false, className = '' }) => {
  const baseStyle = 'px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50';
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-600',
    secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-400',
    success: 'bg-green-500 text-white hover:bg-green-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const FormInput = ({ label, type = 'text', placeholder, value, onChange, required = false }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
};

export const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
