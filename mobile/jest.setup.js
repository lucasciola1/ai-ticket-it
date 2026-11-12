/* eslint-env jest */

// Módulos nativos reemplazados por sus mocks oficiales
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Calendario nativo de Android: en los tests "el usuario elige" el 24/12/2030 y luego las 21:30
jest.mock('@react-native-community/datetimepicker', () => ({
  DateTimePickerAndroid: {
    open: jest.fn(({ mode, onValueChange }) =>
      onValueChange({}, mode === 'date' ? new Date(2030, 11, 24) : new Date(2030, 11, 24, 21, 30)),
    ),
    dismiss: jest.fn(),
  },
}));
