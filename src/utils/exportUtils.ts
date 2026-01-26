import { Alert, Platform, Share } from 'react-native';

// Fallback to RNFS if available? No, stick to Expo APIs if possible, or standard RN.
// Since expo-file-system and expo-sharing are not in package.json, we might have issues if we use them.
// But this is an Expo project ("main": "expo-router/entry").
// Let's assume standard Expo modules are available or we should suggest installing them.
// However, react-native-fs IS in package.json.
// Let's use react-native-fs if platform is native.

let RNFS: any;
if (Platform.OS !== 'web') {
  try {
    RNFS = require('react-native-fs');
  } catch (e) {
    console.warn('react-native-fs not available');
  }
}

export const exportToCSV = async (data: any[], filename: string) => {
  if (!data || !data.length) {
    Alert.alert('No Data', 'There is no data to export.');
    return;
  }

  // Convert JSON to CSV
  const keys = Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map(row => keys.map(key => {
      const val = row[key];
      // Escape quotes and commas
      const stringVal = String(val === null || val === undefined ? '' : val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    }).join(','))
  ].join('\n');

  if (Platform.OS === 'web') {
    // Web implementation
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } else {
    // Native implementation using react-native-fs
    if (!RNFS) {
      Alert.alert('Error', 'File system access not available');
      return;
    }

    const path = `${RNFS.DocumentDirectoryPath}/${filename}.csv`;
    
    try {
      await RNFS.writeFile(path, csvContent, 'utf8');
      
      // Share the file
      // On Android, sharing a file path might need a FileProvider.
      // But typically we can try.
      // Alternatively, just alert where it is saved.
      
      Alert.alert(
        'Export Success', 
        `File saved to: ${path}\n\nDo you want to share it?`,
        [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Share', 
                onPress: async () => {
                    try {
                        // Creating a file url
                        const fileUrl = 'file://' + path;
                         await Share.share({
                            url: fileUrl,
                            title: 'Export Data',
                            message: 'Here is the exported data.'
                        });
                    } catch (e) {
                        console.error(e);
                        Alert.alert('Share Error', 'Could not share file');
                    }
                } 
            }
        ]
      );

    } catch (error: any) {
      console.error('File Write Error:', error);
      Alert.alert('Export Failed', 'Could not write file: ' + error.message);
    }
  }
};
