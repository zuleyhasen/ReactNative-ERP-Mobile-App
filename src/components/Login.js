import React, { useState } from "react";
import { View, StyleSheet, Image, TextInput, TouchableOpacity, Text, Alert, SafeAreaView} from "react-native";

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginPress = async () => {
    if (username === "" || password === "") {
      Alert.alert("Hata", "Kullanıcı adı ve şifre gereklidir.");
      return;
    }
   console.log(username, password);

try {
  const response = await fetch('http://192.168.1.45:8080/aea/WorkflowTrackingBackend/authCheck.php', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const responseText = await response.text(); // Sunucudan gelen yanıtı metin olarak al
  console.log(responseText);

  try {
    const data = JSON.parse(responseText); // Metni JSON'a ayrıştır
    if (data.authenticated) {
      navigation.navigate('Tabs'); // Eğer giriş başarılıysa
    } else {
      Alert.alert("Hata", "Kullanıcı adı veya şifre hatalı."); // Eğer giriş başarısızsa veya sunucudan bir hata mesajı döndüyse
    }
  } catch (error) {
    console.error('JSON Ayrıştırma Hatası:', error);
    Alert.alert("Hata", "Sunucudan geçerli bir yanıt alınamadı.");
  }
} catch (error) {
  console.error('Hata:', error);
  Alert.alert("Hata", "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
}
  };

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <View style={styles.blackBackground}>
        <View style={styles.yellowBackground}>
          <View style={styles.whiteBackground}>
            <Image source={require("../assets/sennaLogo.png")} style={styles.logo} />
          </View>
        </View>
      </View>
      <View style={styles.loginContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            value={username} // Kullanıcı adını state'den al
            onChangeText={setUsername} // Kullanıcı adını state'e kaydet
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Şifre</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={true}
            value={password} // Şifreyi state'den al
            onChangeText={setPassword} // Şifreyi state'e kaydet
          />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  blackBackground: {
    flex: 0.5,
  },
  yellowBackground: {
    backgroundColor: "#E0AA3E",
    padding: 15,
    borderBottomLeftRadius: 80,
    justifyContent: "left",
    alignItems: "left",
  },
  whiteBackground: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    borderBottomLeftRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
  loginContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    maxWidth: 400, // Set a maximum width for the login container
    margin: "auto", // Center the login container horizontally on larger screens
  },
  inputContainer: {
    width: "100%",
    borderBottomColor: "#000000", // Black bottom border
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  inputLabel: {
    color: "#000000", // Black text color
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 40,
    color: "#000000", // Black text color
  },
  loginButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#E0AA3E",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  loginButtonText: {
    color: "#212121",
    fontWeight: "bold",
  },
});
export default Login;


