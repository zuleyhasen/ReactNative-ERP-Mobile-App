import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const ProcessList = ({ route }) => {
  const { updatedProcesses } = route.params || {};
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [processList, setProcessList] = useState([]);
  const [filter, setFilter] = useState('');
  const [isSecondPickerEnabled, setIsSecondPickerEnabled] = useState(false);
  const [isThirdPickerEnabled, setIsThirdPickerEnabled] = useState(false);
  const [productList, setProductList] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const navigation = useNavigation();

  const delay = (milliseconds) => {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  };

  const processOptions = [
    { label: 'Boyama', value: '1' },
    { label: 'Dikim', value: '2' },
    { label: 'İşleme', value: '3' },
    { label: 'Kesim', value: '4' },
    { label: 'Nakış', value: '5' },
    { label: 'Plise', value: '6' },
    { label: 'Ütü Paket', value: '7' },
  ];
  

  const handleSend = async () => {
    if (!selectedProduct || !selectedProcess || !selectedWorkshop) {
      Alert.alert("Uyarı", "Lütfen ürün, işlem ve atölye seçimlerini yapınız.");
      return;
    }

    const processId = processOptions.find(option => option.value === selectedProcess)?.value || '';
    const productItem = productList.find(productItem => productItem.ProductName === selectedProduct);
    const productId = productItem ? productItem.ProductId : '';
    const workshopId = selectedWorkshop ? workshops.find(workshop => workshop.workshopName === selectedWorkshop).workshopId : '';
    const completedProcessMessage = {
      ProcessId: processId,
      ProductId: productId,
      ProcessShopId: workshopId,
      isSelected: false,
    };
    
    try {
      const response = await fetch('http://192.168.31.63:8080/aea/WorkflowTrackingBackend/addProcessFlow.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(completedProcessMessage)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log(completedProcessMessage)
    } catch (error) {
      console.error('Error adding process:', error);
      Alert.alert("Hata", "İşlem eklenirken bir hata oluştu.");
      return;
    }

    await delay(100);
    fetchProcessFlow();
    setSelectedProduct('');
    setSelectedProcess('');
    setSelectedWorkshop('');
    setIsSecondPickerEnabled(false);
    setIsThirdPickerEnabled(false);
  };

  const handleProcessChange = async (value) => {
    setSelectedProcess(value);
    setIsThirdPickerEnabled(true);

    const fetchedWorkshops = await fetchWorkshopsForProcess(value);
    setWorkshops(fetchedWorkshops);

    setSelectedWorkshop('');
  };

  const handleNextProcess = () => {
    const selectedProcesses = processList.filter(process => process.isSelected);
  
    if (selectedProcesses.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir işlem seçin.');
    } else {
      navigation.navigate('NextProcessPage', {
        selectedProcesses,
      });
    }
  };

  const handleToggleSelection = (id) => {
    const updatedProcesses = processList.map(process => {
      if (process.ProcessFlowId === id) { // Değiştirilen satır
        return {
          ...process,
          isSelected: !process.isSelected,
        };
      }
      return process;
    });
    setProcessList(updatedProcesses);
  };

  

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

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      const workshops = data.shops.map(workshop => ({
        workshopName: workshop.ShopName,
        workshopId: workshop.ProcessShopID,
      }));

      return workshops;
    } catch (error) {
      console.error('Error fetching workshops:', error);
      return [];
    }
  };

  useEffect(() => {
    const checkSessionInterval = setInterval(() => {
      fetch('http://192.168.31.63:8080/aea/WorkflowTrackingBackend/authCheck.php', {
        method: 'GET',
      })
        .then(response => response.json())
        .then(data => {
          if (data.authenticated === false) {
            clearInterval(checkSessionInterval);
            setSelectedProduct('');
            setSelectedProcess('');
            setSelectedWorkshop('');
            setProcessList([]);
            Alert.alert("Hata", "Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.");
            navigation.navigate('Login');
          }
        })
        .catch(error => {
          console.error('Hata:', error);
          Alert.alert("Hata", "Bir hata oluştu. Lütfen tekrar deneyin.");
        });
    }, 10000);
    return () => {
      clearInterval(checkSessionInterval);
    };
  }, [navigation]);

  useEffect(() => {
    fetch('http://192.168.31.63:8080/aea/WorkflowTrackingBackend/products.php')
      .then(response => response.json())
      .then(data => {
        setProductList(data);
      })
      .catch(error => {
        console.error('Hata:', error);
      });
  }, []);

  // updatedProcesses dizisi değiştiğinde processList'i güncelle
  useEffect(() => {
    fetchProcessFlow();
    // if (updatedProcesses && updatedProcesses.length > 0) {
    //   const updatedCompletedProcesses = processList.map(process => {
    //     const updatedProcess = updatedProcesses.find(updProcess => updProcess.id === process.id);
    //     if (updatedProcess) {
    //       return {
    //         ...process,
    //         process: updatedProcess.process,
    //         workshop: updatedProcess.workshop,
    //       };
    //     }
    //     return process;
    //   });
    //   setProcessList(updatedCompletedProcesses);
    // }
  }, [updatedProcesses, filter]);


    const fetchProcessFlow = async () => {
      try {
        const response = await fetch('http://192.168.31.63:8080/aea/WorkflowTrackingBackend/productsInfo.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            filter: filter,
            query:'latest',
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProcessList(data);
      } catch (error) {
        console.error('Error fetching process flow:', error);
        Alert.alert("Hata", "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    };


  const [isNextButtonVisible, setIsNextButtonVisible] = useState(false);
  useEffect(() => {
    setIsNextButtonVisible(processList.length > 0);
  }, [processList]);

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedProduct}
          onValueChange={(value) => {
            setSelectedProduct(value);
            setIsSecondPickerEnabled(true);
            setIsThirdPickerEnabled(false);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Ürün Seçiniz..." value="" />
          {productList.map(product => (
            <Picker.Item key={product.ProductId} label={product.ProductName} value={product.ProductName} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedProcess}
          onValueChange={(value) => {
            setSelectedProcess(value);
            setIsThirdPickerEnabled(true);
            handleProcessChange(value);
          }}
          style={styles.picker}
          enabled={isSecondPickerEnabled}
        >
          <Picker.Item label="İşlem Seçiniz..." value="" />
          {processOptions.map(option => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedWorkshop}
          onValueChange={value => setSelectedWorkshop(value)}
          style={styles.picker}
          enabled={isThirdPickerEnabled}
        >
          <Picker.Item label="Atölye Seçiniz..." value="" />
          {workshops.map((workshop, index) => (
            <Picker.Item key={index} label={workshop.workshopName} value={workshop.workshopName} />
          ))}
        </Picker>
      </View>

      <View style={styles.buttonAndFilterContainer}>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Gönder</Text>
        </TouchableOpacity>

        <View style={styles.filterPickerContainer}>
          <Picker
            selectedValue={filter}
            onValueChange={(value) => {
              setFilter(value)
            }}
            style={styles.filterPicker}
          >
            <Picker.Item label="Sırala..." value="" />
            <Picker.Item label="Eski tarihten Yeni tarihe" value="ASC" />
            <Picker.Item label="Yeni tarihten Eski tarihe" value="DESC" />
          </Picker>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.headerItem}>
          <Text style={styles.headerText}>Ürün</Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerText}>İşlem</Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerText}>Atölye</Text>
        </View>
      </View>

      <FlatList
        data={processList}
        keyExtractor={(item) => (item.ProcessFlowId ? item.ProcessFlowId.toString() : item.id.toString())}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.completedProcess}
            onPress={() => handleToggleSelection(item.ProcessFlowId)}
          >
            <View style={styles.processItem}>
              <Text style={styles.processText}>{item.ProductName}</Text>
            </View>
            <View style={styles.processItem}>
              <Text style={styles.processText}>{item.ProcessName}</Text>
            </View>
            <View style={styles.processItem}>
              <Text style={styles.processText}>{item.ShopName}</Text>
            </View>
            {item.isSelected ? (
              <FontAwesome5 name="check-circle" size={24} color="green" />
            ) : (
              <FontAwesome5 name="circle" size={24} color="gray" />
            )}
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <View>
            <View style={{ height: 20 }} />
            {isNextButtonVisible && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextProcess}
              >
                <Text style={styles.nextButtonText}>Sonraki</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  pickerContainer: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  picker: {
    width: '100%',
    height: 40,
  },
  buttonAndFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#E0AA3E',
    padding: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterPickerContainer: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 8,
    width: 150,
    height: 40,
  },
  filterPicker: {
    width: 150,
    color: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 40,
  },
  headerItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#E0AA3E',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedProcess: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'lightgray',
    padding: 10,
    marginVertical: 10,
  },
  processItem: {
    flex: 1,
  },
  processText: {
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    width: 100,
    height: 35,
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 10,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProcessList;
