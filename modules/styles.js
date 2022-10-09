import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000e21'
  },
  viewContainer: {
    flex: 1,
    backgroundColor: '#000e21'
  },
  viewHeader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000a17'
  },
  viewBody: {
    flex: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewFooter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000a17'
  },
  scrollView: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000e21'
  },
  viewChat: {
  },
  scrollViewChat: {
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0d9488',
    padding: 10,
    shadowRadius: '5'
  },
  buttonText: {
    color: 'white'
  },
  text: {
    color: '#5eead4',
    fontSize: 28
  },
  textInput: {
    color: '#5eead4',
    borderColor: 'white',
    height: 40,
    borderWidth: 3,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    opacity: 0.8
  },
  modalBody: {
    flex: 1,
    backgroundColor: '#164e63',
    marginBottom: 100,
    marginLeft: 50,
    marginRight: 50,
    marginTop: 100,
    shadowColor: 'white',
    borderColor: '#34d399',
    borderWidth: 1,
    borderRadius: 10,
    shadowOffset: { width: 100, height: 100 },
    shadowColor: 'black',
    shadowRadius: 100,
    shadowOpacity: 1,
    elevation: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalHeader: {
    flex: 1,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  modalFooter: {
    flex: 1,
    backgroundColor: '#0891b2',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  }
})

export { styles }
