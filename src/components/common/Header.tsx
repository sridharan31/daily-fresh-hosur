// app/components/common/Header.tsx - Full Featured Customer Header
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../lib/supabase/store';
import { logoutUser as logout } from '../../../lib/supabase/store/actions/authActions';
import { RootState } from '../../../lib/supabase/store/rootReducer';

interface HeaderAction {
  icon: string;
  onPress: () => void;
  testID?: string;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActions?: HeaderAction[];
  backgroundColor?: string;
  titleColor?: string;
  iconColor?: string;
  variant?: 'default' | 'large' | 'minimal' | 'customer';
  style?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  testID?: string;
  showProfile?: boolean;
  showLocation?: boolean;
  onProfilePress?: () => void;
  onLocationPress?: () => void;
  location?: string;
  showSearch?: boolean;
  showCart?: boolean;
  onCartPress?: () => void;
  onNotificationPress?: () => void;
  cartItemCount?: number;
  notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({
  title = "Daily Fresh Hosur",
  subtitle,
  showBack = false,
  onBack,
  rightActions = [],
  backgroundColor = '#ffffff',
  titleColor = '#333333',
  iconColor = '#333333',
  variant = 'customer',
  style,
  titleStyle,
  testID,
  showProfile = true,
  showLocation = true,
  onProfilePress,
  onLocationPress,
  location = 'Select Location',
  showSearch = false,
  showCart = true,
  onCartPress,
  onNotificationPress,
  cartItemCount = 0,
  notificationCount = 3,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    const fetchAddress = async () => {
      if (user?.id) {
        try {
          // We need to import userService dynamically or ensure it's available
          // For now, let's assume we can use the same pattern as checkout
          const { userService } = require('../../../lib/supabase/services/user');
          const addresses = await userService.getUserAddresses(user.id);
          const defaultAddress = addresses.find((addr: any) => addr.is_default) || addresses[0];
          if (defaultAddress) {
            setDisplayLocation(`${defaultAddress.city}, ${defaultAddress.state}`);
          } else {
            setDisplayLocation('Select Location');
          }
        } catch (e) {
          console.error("Failed to fetch address for header", e);
        }
      }
    };
    fetchAddress();
  }, [user]);

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    zIndex: 1000,
    ...style,
  };

  const handleProfileToggle = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    if (confirm('Are you sure you want to logout?')) {
      // Clear all session data
      dispatch(logout());

      // Force reload to ensure clean state and redirection to entry point
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.replace('/');
      }
    }
  };

  const handleMyProfile = () => {
    setShowProfileDropdown(false);
    console.log('My Profile clicked');
  };

  const handleMyOrders = () => {
    setShowProfileDropdown(false);
    console.log('My Orders clicked');
  };

  // Customer header layout (default)
  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Main Header */}
      <div style={{ ...headerStyle }}>
        {/* Left: Location */}
        {showLocation && (
          <div style={leftSectionStyle}>
            <button
              onClick={onLocationPress}
              style={locationButtonStyle}
            >
              <span style={{ fontSize: '16px', color: '#4CAF50', marginRight: '6px' }}>📍</span>
              <div>
                <div style={deliverToTextStyle}>Deliver to</div>
                <div style={locationTextStyle}>{displayLocation}</div>
              </div>
            </button>
          </div>
        )}

        {/* Center: Logo/Title */}
        <div style={centerSectionStyle}>
          {title === "Daily Fresh Hosur" ? (
            <div style={logoStyle}>
              <img
                src={require('../../../assets/branding/Fresh_From_Hosur_Farms.png')}
                alt="Fresh From Hosur Farms"
                style={{ height: 40, objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div style={{ ...titleStyle, color: titleColor, fontSize: '18px', fontWeight: 'bold' }}>
              {title}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div style={rightSectionStyle}>
          {/* Notifications */}
          <button
            onClick={onNotificationPress}
            style={actionButtonStyle}
            aria-label="Notifications"
          >
            <span style={{ fontSize: '24px', color: iconColor }}>�</span>
            {notificationCount > 0 && (
              <div style={{ ...badgeStyle, backgroundColor: '#ff4444' }}>
                <span style={badgeTextStyle}>{notificationCount}</span>
              </div>
            )}
          </button>

          {/* Cart */}
          {showCart && (
            <button
              onClick={onCartPress}
              style={actionButtonStyle}
              aria-label="Shopping Cart"
            >
              <span style={{ fontSize: '24px', color: iconColor }}>🛒</span>
              {cartItemCount > 0 && (
                <div style={{ ...badgeStyle, backgroundColor: '#4CAF50' }}>
                  <span style={badgeTextStyle}>{cartItemCount}</span>
                </div>
              )}
            </button>
          )}

          {/* Profile */}
          {showProfile && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleProfileToggle}
                style={profileButtonStyle}
                aria-label="User Profile"
              >
                <span style={profileInitialStyle}>
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'G'}
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <>
                  <div style={dropdownStyle}>
                    <div style={dropdownContentStyle}>
                      <button style={dropdownItemStyle} onClick={handleMyProfile}>
                        <span style={{ fontSize: '20px', marginRight: '12px' }}>👤</span>
                        <span>My Profile</span>
                      </button>

                      <button style={dropdownItemStyle} onClick={() => {
                        setShowProfileDropdown(false);
                        router.push('/(tabs)/orders');
                      }}>
                        <span style={{ fontSize: '20px', marginRight: '12px' }}>📋</span>
                        <span>My Orders</span>
                      </button>

                      <div style={dropdownDividerStyle}></div>

                      <button
                        style={{ ...dropdownItemStyle, color: '#ff4444' }}
                        onClick={handleLogout}
                      >
                        <span style={{ fontSize: '20px', marginRight: '12px' }}>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>

                  {/* Overlay to close dropdown */}
                  <div
                    style={overlayStyle}
                    onClick={() => setShowProfileDropdown(false)}
                  ></div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div style={searchContainerStyle}>
          <div style={searchBarStyle}>
            <span style={{ fontSize: '20px', color: '#999', marginRight: '8px' }}>🔍</span>
            <span style={searchPlaceholderStyle}>Search for fresh produce...</span>
          </div>
          <button style={filterButtonStyle}>
            <span style={{ fontSize: '20px', color: '#4CAF50' }}>⚙️</span>
          </button>
        </div>
      )}
    </div>
  );

};

// Styles
const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  minHeight: '60px',
};

const leftSectionStyle: React.CSSProperties = {
  flex: 1,
};

const locationButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const deliverToTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#666',
  lineHeight: '14px',
};

const locationTextStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
  lineHeight: '16px',
};

const centerSectionStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const rightSectionStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '8px',
};

const actionButtonStyle: React.CSSProperties = {
  position: 'relative',
  padding: '8px',
  borderRadius: '20px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '4px',
  right: '4px',
  borderRadius: '8px',
  minWidth: '16px',
  height: '16px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const badgeTextStyle: React.CSSProperties = {
  color: 'white',
  fontSize: '10px',
  fontWeight: 'bold',
};

const profileButtonStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '18px',
  backgroundColor: '#4CAF50',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: '4px',
  border: 'none',
  cursor: 'pointer',
};

const profileInitialStyle: React.CSSProperties = {
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '45px',
  right: '0',
  zIndex: 1000,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

const dropdownContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '8px 0',
  minWidth: '180px',
  border: '1px solid #e0e0e0',
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: '500',
  color: '#333',
};

const dropdownDividerStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: '#e0e0e0',
  margin: '4px 0',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 999,
  backgroundColor: 'transparent',
};

const searchContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px 12px',
  gap: '8px',
};

const searchBarStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  borderRadius: '25px',
  padding: '10px 16px',
  gap: '8px',
};

const searchPlaceholderStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#999',
  flex: 1,
};

const filterButtonStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '20px',
  backgroundColor: '#f5f5f5',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: 'none',
  cursor: 'pointer',
};

export default Header;