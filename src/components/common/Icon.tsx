import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';

type IconSet = 'material' | 'fontAwesome' | 'ionicons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  type?: IconSet;
  style?: any;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000',
  type = 'material',
  style
}) => {
  switch (type) {
    case 'fontAwesome':
      return <FontAwesome name={name as any} size={size} color={color} style={style} />;
    case 'ionicons':
      return <Ionicons name={name as any} size={size} color={color} style={style} />;
    case 'material':
    default:
      return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
  }
};

export default Icon;