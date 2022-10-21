import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";

export default function Search(props) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async (search) => {
    const db = getFirestore();
    const q = query(collection(db, "users"), where("name", ">=", search));
    let users = [];
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const data = doc.data();
      const id = doc.id;
      users.push({ id, ...data });
    });
    setUsers(users);
  };

  return (
    <View>
      <TextInput
        placeholder="Type Here..."
        onChangeText={(search) => fetchUsers(search)}
      />
      <FlatList
        numColumns={1}
        horizontal={false}
        data={users}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("Profile", { uid: item.id })
            }
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
