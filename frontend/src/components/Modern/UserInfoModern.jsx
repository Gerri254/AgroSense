import { Bell, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const UserInfoModern = () => {
  const { user } = useApp();

  return (
    <div className="user-info-modern">
      <div className="user-info-icons">
        <Bell size={20} />
        <MessageCircle size={20} />
      </div>
      <h4>{user?.username || 'Farmer'}</h4>
      <img
        src="https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/40b7cce2-c289-4954-9be0-938479832a9c"
        alt="user"
      />
    </div>
  );
};

export default UserInfoModern;
