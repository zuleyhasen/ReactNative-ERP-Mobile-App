import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';

const NextProcessPage = () => {
  const [selectedNextProcess, setSelectedNextProcess] = useState('');
  const [selectedNextWorkshop, setSelectedNextWorkshop] = useState('');
  const [workshops, setWorkshops] = useState([]);
  const [isSecondPickerEnabled, setIsSecondPickerEnabled] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedProcesses } = route.params;

  const processOptions = [
    { label: 'Boyama', value: '1' },
    { label: 'Dikim', value: '2' },
    { label: 'İşleme', value: '3' },
    { label: 'Kesim', value: '4' },
    { label: 'Nakış', value: '5' },
    { label: 'Plise', value: '6' },
    { label: 'Ütü Paket', value: '7' },
  ];

  // Geri dönme işlevi
  const handleGoBack = () => {
    navigation.navigate('Tabs');
  };


  // Atölye verilerini alma
  const fetchWorkshopsForProcess = async (processId) => {
    try {
      const response = await fetch('http://192.168.31.63:8080/aea/WorkflowTrackingBackend/process_shops_post.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(processId)
      });

      const data = await response.json();
      console.log('Workshops:', data);

      const workshops = data.shops.map(workshop => ({
        workshopName: workshop.ShopName,
        workshopId: workshop.ProcessShopID,
      }));
      console.log('Workshops:', workshops);

      // Atölyeleri ayarladığınızda bu değişkenlere değeri atayın
      setWorkshops(workshops);
      setIsSecondPickerEnabled(true);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      return [];
    }
  };

  const applyChangesToSelectedProcesses = async () => {
    if (!selectedNextProcess || !selectedNextWorkshop) {
      Alert.alert('Uyarı', 'Lütfen yeni işlem ve atölye seçimlerini yapınız.');
      return;
    }

    // Seçilen işlemi ve atölyeyi alın
    const selectedProcess = processOptions.find(option => option.value === selectedNextProcess);
    const selectedWorkshop = workshops.find(workshop => workshop.workshopId === selectedNextWorkshop);

    if (!selectedProcess || !selectedWorkshop) {
      Alert.alert('Hata', 'Seçilen işlem veya atölye bulunamadı.');
      return;
    }

    // Güncellenecek işlem için ProductId'i belirleyin
    const selectedProcessId = selectedProcess.value;
    const selectedWorkshopId = selectedWorkshop.workshopId;

    // Seçilen işlemi güncelleyin
    const updatedProcesses = selectedProcesses.map(process => {
      return {
        ProcessId: selectedProcessId,
        ProcessShopId: selectedWorkshopId,
        ProductId: process.ProductId,
      };
    });

    console.log('Selected Processes:', selectedProcesses);
    console.log('Updated Processes:', updatedProcesses);

    try {
      const response = await fetch('http://192.168.31.63:8080/aea/WorkflowTrackingBackend/updateProcessFlow.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updatedProcesses), // Güncellenen işlemleri JSON olarak gönderin.
      });

      if (response.ok) {
        console.log('Seçilen tüm işlemler başarıyla tamamlandı.');
      } else {
        console.error('İşlem güncelleme başarısız oldu.');
      }
    } catch (error) {
      console.error('İşlem güncelleme sırasında bir hata oluştu:', error);
    }
    navigation.navigate('Tabs', { updatedProcesses });
  };

  const handleProcessChange = async (value) => {
    setSelectedNextProcess(value);

    if (value) {
      const fetchedWorkshops = await fetchWorkshopsForProcess(value);
      setIsSecondPickerEnabled(true);
    } else {
      setWorkshops([]);
      setIsSecondPickerEnabled(false);
    }

    // Yeni işlem seçildiğinde, atölye seçimini sıfırla
    setSelectedNextWorkshop('');
  };
  
  const handleDepoyaUlasiButton = async () => {

    // Seçilen işlemi güncelleyin
    const updatedProcesses = selectedProcesses.map(process => {
      return {
        ProductId: process.ProductId,
        IsCompleted: 1,
      };
    });

    console.log('Updated Processes:', updatedProcesses);

    try {
      const response = await fetch('http://192.168.31.63:8080/aea/WorkflowTrackingBackend/updateCompleteStatus.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updatedProcesses), // Güncellenen işlemleri JSON olarak gönderin.
      });

    } catch (error) {
      console.error('İşlem güncelleme sırasında bir hata oluştu:', error);
    }
    navigation.navigate('Tabs', { updatedProcesses });
  };
  return (
    <View style={styles.container}>
      <View style={styles.goBackButtonContainer}>
        <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
          <Text style={styles.goBackButtonText}>Geri Dön</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.depoButton} onPress={handleDepoyaUlasiButton}>
          <Text style={styles.applyButtonText}>Depoya Ulaştı</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>Yeni İşlem Seçiniz</Text>
      </View>
      <Picker
        selectedValue={selectedNextProcess}
        onValueChange={(value) => handleProcessChange(value)}
        style={styles.picker}
      >
        <Picker.Item label="İşlem Seçiniz..." value="" />
        {processOptions.map(option => (
          <Picker.Item key={option.value} label={option.label} value={option.value} />
        ))}
      </Picker>

      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>Yeni Atölye Seçiniz</Text>
      </View>
      <Picker
        selectedValue={selectedNextWorkshop}
        onValueChange={value => setSelectedNextWorkshop(value)}
        style={styles.picker}
        enabled={isSecondPickerEnabled}
      >
        <Picker.Item label="Atölye Seçiniz..." value="" />
        {workshops.map((workshop, index) => (
          <Picker.Item key={index} label={workshop.workshopName} value={workshop.workshopId} />
        ))}
      </Picker>

      <TouchableOpacity style={styles.applyButton} onPress={applyChangesToSelectedProcesses}>
        <Text style={styles.applyButtonText}>Değişiklikleri Uygula</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  depoButton: {
    backgroundColor: '#F88017',
    padding: 10,
    borderRadius: 20,
    marginLeft: 130,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goBackButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginLeft: 5,
  },
  goBackButton: {
    backgroundColor: '#E0AA3E',
    padding: 10,
    borderRadius: 20,
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  }
});

export default NextProcessPage;
