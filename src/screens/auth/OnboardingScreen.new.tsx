import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const onboardingData = [
    {
      id: '1',
      title: 'Fresh Groceries',
      description: 'Get fresh groceries delivered to your doorstep',
      image: 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=Fresh+Groceries'
    },
    {
      id: '2',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery service',
      image: 'https://via.placeholder.com/300x200/2196F3/ffffff?text=Fast+Delivery'
    },
    {
      id: '3',
      title: 'Best Quality',
      description: 'Premium quality products at best prices',
      image: 'https://via.placeholder.com/300x200/FF9800/ffffff?text=Best+Quality'
    }
  ];

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const currentSlide = onboardingData[currentIndex];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{ 
        position: 'absolute', 
        top: '50px', 
        right: '20px' 
      }}>
        <button 
          onClick={handleSkip}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#666',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div style={{ 
        textAlign: 'center', 
        maxWidth: '400px',
        marginBottom: '50px'
      }}>
        <img 
          src={currentSlide.image} 
          alt={currentSlide.title}
          style={{ 
            width: '300px', 
            height: '200px', 
            marginBottom: '30px',
            borderRadius: '10px'
          }}
        />
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#333',
          marginBottom: '15px'
        }}>
          {currentSlide.title}
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#666',
          lineHeight: '1.5',
          marginBottom: '30px'
        }}>
          {currentSlide.description}
        </p>
      </div>

      {/* Pagination dots */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px' 
      }}>
        {onboardingData.map((_, index) => (
          <div
            key={index}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '5px',
              backgroundColor: index === currentIndex ? '#4CAF50' : '#ddd',
              margin: '0 5px'
            }}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        width: '100%', 
        maxWidth: '400px',
        alignItems: 'center'
      }}>
        <button 
          onClick={handleSignIn}
          style={{
            backgroundColor: 'transparent',
            border: '2px solid #4CAF50',
            color: '#4CAF50',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Sign In
        </button>
        
        <button 
          onClick={handleNext}
          style={{
            backgroundColor: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;