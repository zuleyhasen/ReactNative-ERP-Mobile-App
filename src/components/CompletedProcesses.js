import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CompletedProcesses = () => {
  const [data, setData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    const checkSessionInterval = setInterval(() => {
    // Ürünleri çekmek için bir HTTP isteği yapın
    fetch('http://192.168.31.63:8080/aea/WorkflowTrackingBackend/products.php')
      .then((response) => response.json())
      .then((data) => {
        setProductList(data);
      })
      .catch((error) => {
        console.error('Hata:', error);
      });

    // Tamamlanmış işlemleri çekmek için bir HTTP isteği yapın
    fetch('http://192.168.31.63:8080/aea/WorkflowTrackingBackend/productsInfo.php')
      .then((response) => response.json())
      .then((json) => {
        // Tarihleri sadece gün olarak düzenle
        const processedData = json.map((item) => ({
          ...item,
          DateTime: item.DateTime.split(' ')[0], // Tarihi sadece gün olarak al
        }));
        setData(processedData);
      })
      .catch((error) => console.error(error));
    }, 1000);
  return () => clearInterval(checkSessionInterval);

  }, []);

  const filteredData = selectedProduct
    ? data.filter((item) => item.ProductName === selectedProduct)
    : data;



  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedProduct}
          onValueChange={(value) => setSelectedProduct(value)}
        >
          <Picker.Item label="Tüm Ürünler" value="" />
          {productList.map((product) => (
            <Picker.Item
              key={product.ProductId}
              label={product.ProductName}
              value={product.ProductName}
            />
          ))}
        </Picker>
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
        <View style={styles.headerItem}>
          <Text style={styles.headerText}>Tarih</Text>
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => (item.ProcessFlowId ? item.ProcessFlowId.toString() : index.toString())}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.completedProcess}
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
            <View style={styles.processItem}>
              <Text style={[styles.processText, styles.dateText]}>
                {item.DateTime}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 20,
    marginRight: 30,
  },
  pickerContainer: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  picker: {
    width: '100%',
    height: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  headerItem: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#E0AA3E',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 5,
  },
  headerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedProcess: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'lightgray',
    padding: 5,
    marginVertical: 10,
  },
  processItem: {
    flex: 1,
    alignItems: 'center',
  },
  processText: {
    fontSize: 13,
  },
  dateText: {
    textAlign: 'center',
    fontSize: 14,
  },
});

export default CompletedProcesses;
