import React, { useState, useEffect } from 'react';
import { StyleSheet, Modal, ActivityIndicator, TextInput, Text, View, Button, Dimensions, AsyncStorage, Keyboard } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FlatList } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

const HomeScreen = () => {
  const [todoList, setTodoList] = useState([]);
  const [todoItem, setTodoItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const textInputHandler = (text) => {
    setTodoItem(text);
  }

  _retrieveStorage = async () => {
    try {
      setIsLoading(true);
      const todoListString = await AsyncStorage.getItem("TodoList");
      if (!todoListString) {
        setIsLoading(false);
        return;
      }
      const todoList = JSON.parse(todoListString);
      if (todoList.length === 0) {
        setIsLoading(false);
        return;
      }
      setTodoList(todoList);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const saveTodoItem = () => {
    setTodoList((oldList) => {
      const newList = [...oldList];
      const newTodo = {
        text: todoItem,
        id: Math.random() * 1000
      }
      newList.push(newTodo);
      return newList;
    });
    Keyboard.dismiss();
    setTodoItem(null);
  }

  const deleteItemHandler = (itemId) => {
    setTodoList((oldList) => {
      return oldList.filter((item) => item.id !== itemId);
    });
  }

  useEffect(() => {
    const retrieveFromDb = async() => {
      try {
        await _retrieveStorage();
      } catch (error) {
        console.log(error);
      }
    }
    retrieveFromDb();
  }, [])

  useEffect(() => {
    const storeInDb = async () => {
      try {
        await AsyncStorage.setItem('TodoList', JSON.stringify(todoList));
      } catch (error) {
        
      }
    }
    storeInDb();
  }, [todoList]);


  return (
    <View style={styles.container}>
      {
        isLoading &&
        <Modal
          style={styles.modal}
          animationType="fade"
          transparent={false}
          visible={isLoading}
        >
          <ActivityIndicator size="large" color="#0000ff"/>
        </Modal>
      }
      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          placeholder="Add a new task"
          onChangeText={(text) => textInputHandler(text)}
          value={todoItem}
          onSubmitEditing={saveTodoItem}
          keyb
        />
        <Button
          onPress={saveTodoItem}
          title="Save"
          disabled={!todoItem}
        />
      </View>
      <View>
      {
        todoList.length > 0 ? 
          <FlatList
            data={todoList}
            keyExtractor={item => item.id.toString()}
            renderItem={ ({item}) => (
              <View style={styles.scrollView}>
                <Text>{item.text}</Text>
                <Button id={item.id} onPress={deleteItemHandler.bind(this, item.id)} title="Delete"></Button>
              </View>
            )
            }
          />
          :
          <Text>No Items yet... Maybe add one?</Text>
      }
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            title: "ToDo",
            headerStyle: {
              backgroundColor: 'black'
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
    marginLeft: 10,
    marginRight: 10,
  },
  modal: {
    justifyContent: 'center'
  },
  textInput: {
    height: 40
  },
  scrollView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 10
  },
  inputArea: {
    marginBottom: 10
  }
  
});
